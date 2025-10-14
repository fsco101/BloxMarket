import express from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js'; // Changed from default import to named import
import { Trade } from '../models/Trade.js';
import { Vouch } from '../models/Vouch.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Admin middleware - require authentication and admin role
router.use(authenticateToken);
router.use(requireAdmin);

// Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const search = req.query.search;
    const role = req.query.role;
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

    const [users, total] = await Promise.all([
      User.find(query)
        .select('-password_hash -tokens')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      User.countDocuments(query)
    ]);

    res.json({
      users: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        roblox_username: user.roblox_username,
        role: user.role,
        credibility_score: user.credibility_score,
        is_verified: user.is_verified,
        is_middleman: user.is_middleman,
        verification_requested: user.verification_requested,
        middleman_requested: user.middleman_requested,
        is_active: user.is_active,
        createdAt: user.createdAt,
        last_login: user.last_login
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Update user role
router.patch('/users/:userId/role', async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    const validRoles = ['user', 'moderator', 'admin', 'banned'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from changing their own role
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ error: 'Cannot change your own role' });
    }

    user.role = role;
    if (role === 'banned') {
      user.banned_at = new Date();
      user.ban_reason = req.body.reason || 'No reason provided';
    } else {
      user.banned_at = null;
      user.ban_reason = null;
    }

    await user.save();

    res.json({
      message: 'User role updated successfully',
      user: {
        _id: user._id,
        username: user.username,
        role: user.role,
        banned_at: user.banned_at,
        ban_reason: user.ban_reason
      }
    });

  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({ error: 'Failed to update user role' });
  }
});

// Verify user
router.patch('/users/:userId/verify', async (req, res) => {
  try {
    const { userId } = req.params;
    const { verified } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.is_verified = verified;
    user.verification_requested = false;
    await user.save();

    res.json({
      message: `User ${verified ? 'verified' : 'unverified'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        is_verified: user.is_verified
      }
    });

  } catch (error) {
    console.error('Verify user error:', error);
    res.status(500).json({ error: 'Failed to verify user' });
  }
});

// Set middleman status
router.patch('/users/:userId/middleman', async (req, res) => {
  try {
    const { userId } = req.params;
    const { middleman } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.is_middleman = middleman;
    user.middleman_requested = false;
    await user.save();

    res.json({
      message: `User middleman status ${middleman ? 'granted' : 'revoked'} successfully`,
      user: {
        _id: user._id,
        username: user.username,
        is_middleman: user.is_middleman
      }
    });

  } catch (error) {
    console.error('Set middleman status error:', error);
    res.status(500).json({ error: 'Failed to set middleman status' });
  }
});

// Get admin statistics
router.get('/stats', async (req, res) => {
  try {
    const [
      totalUsers,
      totalTrades,
      activeTrades,
      totalVouches,
      pendingVerifications,
      pendingMiddlemanRequests,
      bannedUsers
    ] = await Promise.all([
      User.countDocuments(),
      Trade.countDocuments(),
      Trade.countDocuments({ status: 'active' }),
      Vouch.countDocuments(),
      User.countDocuments({ verification_requested: true }),
      User.countDocuments({ middleman_requested: true }),
      User.countDocuments({ role: 'banned' })
    ]);

    res.json({
      stats: {
        totalUsers,
        totalTrades,
        activeTrades,
        totalVouches,
        pendingVerifications,
        pendingMiddlemanRequests,
        bannedUsers
      }
    });

  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Get pending verification requests
router.get('/verification-requests', async (req, res) => {
  try {
    const users = await User.find({ verification_requested: true })
      .select('-password_hash -tokens')
      .sort({ createdAt: -1 });

    res.json({
      requests: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        roblox_username: user.roblox_username,
        credibility_score: user.credibility_score,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Get verification requests error:', error);
    res.status(500).json({ error: 'Failed to fetch verification requests' });
  }
});

// Get pending middleman requests
router.get('/middleman-requests', async (req, res) => {
  try {
    const users = await User.find({ middleman_requested: true })
      .select('-password_hash -tokens')
      .sort({ createdAt: -1 });

    res.json({
      requests: users.map(user => ({
        _id: user._id,
        username: user.username,
        email: user.email,
        roblox_username: user.roblox_username,
        credibility_score: user.credibility_score,
        is_verified: user.is_verified,
        createdAt: user.createdAt
      }))
    });

  } catch (error) {
    console.error('Get middleman requests error:', error);
    res.status(500).json({ error: 'Failed to fetch middleman requests' });
  }
});

// Delete user (admin only)
router.delete('/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.userId) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }

    // Delete user's trades, vouches, and other related data
    await Promise.all([
      Trade.deleteMany({ user_id: userId }),
      Vouch.deleteMany({ $or: [{ user_id: userId }, { trader_id: userId }] }),
      User.findByIdAndDelete(userId)
    ]);

    res.json({ message: 'User deleted successfully' });

  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

export default router;