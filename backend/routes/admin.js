import express from 'express';
import { User } from '../models/User.js';
import { Trade } from '../models/Trade.js';
import { ForumPost } from '../models/Forum.js';
import { Report } from '../models/Report.js';
import { authenticateToken } from './auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Middleware to check if user is admin
const requireAdmin = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.userId);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  } catch (error) {
    console.error('Admin check error:', error);
    res.status(500).json({ error: 'Failed to verify admin status' });
  }
};

// Get admin dashboard stats
router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const bannedUsers = await User.countDocuments({ role: 'banned' });
    const pendingReports = await Report.countDocuments({ status: 'pending' });
    
    // Count flagged posts (posts with reports)
    const flaggedPosts = await Report.aggregate([
      { $group: { _id: '$post_id', reportCount: { $sum: 1 } } },
      { $match: { reportCount: { $gte: 1 } } },
      { $count: 'total' }
    ]);
    
    const verificationRequests = await User.countDocuments({ 
      $and: [
        { role: { $ne: 'verified' } },
        { $or: [
          { verification_requested: true },
          { middleman_requested: true }
        ]}
      ]
    });

    res.json({
      totalUsers,
      activeUsers,
      flaggedPosts: flaggedPosts[0]?.total || 0,
      pendingReports,
      bannedUsers,
      verificationRequests
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin statistics' });
  }
});

// Get all users with pagination and search
router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search || '';
    const role = req.query.role || '';
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { roblox_username: { $regex: search, $options: 'i' } }
      ];
    }
    
    if (role) {
      query.role = role;
    }

    const users = await User.find(query)
      .select('-password_hash -tokens')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        roblox_username: user.roblox_username,
        role: user.role,
        credibility_score: user.credibility_score,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// Get reports with pagination
router.get('/reports', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const status = req.query.status || '';
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const reports = await Report.find(query)
      .populate('reported_user_id', 'username roblox_username')
      .populate('reported_by_user_id', 'username roblox_username')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Report.countDocuments(query);

    res.json({
      reports: reports.map(report => ({
        _id: report._id,
        reportedUser: {
          _id: report.reported_user_id._id,
          username: report.reported_user_id.username,
          roblox_username: report.reported_user_id.roblox_username
        },
        reportedBy: {
          _id: report.reported_by_user_id._id,
          username: report.reported_by_user_id.username,
          roblox_username: report.reported_by_user_id.roblox_username
        },
        reason: report.reason,
        status: report.status,
        createdAt: report.createdAt,
        type: report.type || 'General'
      })),
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get reports error:', error);
    res.status(500).json({ error: 'Failed to get reports' });
  }
});

// Get flagged posts
router.get('/flagged-posts', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const severity = req.query.severity || '';
    const skip = (page - 1) * limit;

    // Get posts that have reports
    const reportedPosts = await Report.aggregate([
      { $group: { 
          _id: '$post_id', 
          reportCount: { $sum: 1 },
          reasons: { $push: '$reason' },
          latestReport: { $max: '$createdAt' }
        }
      },
      { $match: { reportCount: { $gte: 1 } } },
      { $sort: { latestReport: -1 } },
      { $skip: skip },
      { $limit: limit }
    ]);

    const postsWithDetails = await Promise.all(
      reportedPosts.map(async (reportData) => {
        if (!reportData._id) return null;
        
        const post = await ForumPost.findById(reportData._id)
          .populate('user_id', 'username roblox_username');
        
        if (!post) return null;

        return {
          _id: post._id,
          title: post.title,
          content: post.content.substring(0, 100) + '...',
          author: {
            username: post.user_id.username,
            roblox_username: post.user_id.roblox_username
          },
          category: post.category,
          reports: reportData.reportCount,
          reasons: reportData.reasons,
          createdAt: post.createdAt,
          severity: reportData.reportCount >= 5 ? 'high' : reportData.reportCount >= 3 ? 'medium' : 'low',
          status: 'pending'
        };
      })
    );

    const validPosts = postsWithDetails.filter(post => post !== null);

    res.json({
      posts: validPosts,
      total: validPosts.length,
      page,
      totalPages: Math.ceil(validPosts.length / limit)
    });

  } catch (error) {
    console.error('Get flagged posts error:', error);
    res.status(500).json({ error: 'Failed to get flagged posts' });
  }
});

// Get verification requests
router.get('/verification-requests', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const users = await User.find({
      $and: [
        { role: { $ne: 'verified' } },
        { $or: [
          { verification_requested: true },
          { middleman_requested: true }
        ]}
      ]
    })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

    // Get trade and vouch counts for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const tradeCount = await Trade.countDocuments({ user_id: user._id });
        const vouchCount = await User.aggregate([
          { $match: { _id: user._id } },
          { $lookup: {
              from: 'vouches',
              localField: '_id',
              foreignField: 'vouched_user_id',
              as: 'vouches'
          }},
          { $project: { vouchCount: { $size: '$vouches' } } }
        ]);

        return {
          _id: user._id,
          username: user.username,
          roblox_username: user.roblox_username,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt,
          trades: tradeCount,
          vouches: vouchCount[0]?.vouchCount || 0,
          requestType: user.middleman_requested ? 'Middleman' : 'Verified Trader',
          status: 'pending'
        };
      })
    );

    const total = await User.countDocuments({
      $and: [
        { role: { $ne: 'verified' } },
        { $or: [
          { verification_requested: true },
          { middleman_requested: true }
        ]}
      ]
    });

    res.json({
      requests: usersWithStats,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    });

  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ error: 'Failed to get verification requests' });
  }
});

// Ban/Unban user
router.patch('/users/:userId/ban', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { action, reason } = req.body; // action: 'ban' or 'unban'

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (action === 'ban') {
      user.role = 'banned';
      user.ban_reason = reason || 'Banned by admin';
      user.banned_at = new Date();
    } else if (action === 'unban') {
      user.role = 'user';
      user.ban_reason = undefined;
      user.banned_at = undefined;
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    await user.save();

    res.json({
      message: `User ${action}ned successfully`,
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        ban_reason: user.ban_reason,
        banned_at: user.banned_at
      }
    });

  } catch (error) {
    console.error('Ban/unban user error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Update user role
router.patch('/users/:userId/role', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const validRoles = ['user', 'verified', 'moderator', 'admin', 'banned'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    ).select('-password_hash -tokens');

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Update report status
router.patch('/reports/:reportId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, action } = req.body; // status: 'reviewed', 'resolved'; action: 'approve', 'reject'

    if (!mongoose.Types.ObjectId.isValid(reportId)) {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: status || 'reviewed' },
      { new: true }
    ).populate('reported_user_id', 'username')
     .populate('reported_by_user_id', 'username');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({
      message: 'Report updated successfully',
      report: {
        _id: report._id,
        status: report.status,
        reportedUser: report.reported_user_id.username,
        reportedBy: report.reported_by_user_id.username
      }
    });

  } catch (error) {
    console.error('Update report error:', error);
    res.status(500).json({ error: 'Failed to update report' });
  }
});

// Delete flagged post
router.delete('/posts/:postId', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    const post = await ForumPost.findByIdAndDelete(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Also delete related reports
    await Report.deleteMany({ post_id: postId });

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ error: 'Failed to delete post' });
  }
});

// Approve verification request
router.patch('/verification/:userId/approve', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const { type } = req.body; // 'verified' or 'middleman'

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (type === 'middleman') {
      user.role = 'middleman';
      user.middleman_requested = false;
    } else {
      user.role = 'verified';
      user.verification_requested = false;
    }

    await user.save();

    res.json({
      message: 'Verification approved successfully',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Approve verification error:', error);
    res.status(500).json({ error: 'Failed to approve verification' });
  }
});

// Reject verification request
router.patch('/verification/:userId/reject', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.verification_requested = false;
    user.middleman_requested = false;
    await user.save();

    res.json({
      message: 'Verification rejected successfully',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Reject verification error:', error);
    res.status(500).json({ error: 'Failed to reject verification' });
  }
});

export default router;