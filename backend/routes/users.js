import express from 'express';
import { User } from '../models/User.js';
import { Trade } from '../models/Trade.js';
import { Vouch } from '../models/Vouch.js';
import { Wishlist } from '../models/Wishlist.js';
import { authenticateToken } from './auth.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/avatars';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'avatar-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB limit for avatars
    files: 1 // Only one avatar per upload
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for avatars'), false);
    }
  }
});

// Get current user profile (protected) - MUST be before /:userId route
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get user stats
    const totalTrades = await Trade.countDocuments({ user_id: userId });
    const totalWishlistItems = await Wishlist.countDocuments({ user_id: userId });
    
    const vouchStats = await Vouch.aggregate([
      { $match: { vouched_user_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalVouches: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    const stats = vouchStats[0] || { totalVouches: 0, averageRating: 0 };

    res.json({
      id: user._id,
      username: user.username,
      email: user.email,
      robloxUsername: user.roblox_username,
      credibilityScore: user.credibility_score,
      role: user.role,
      avatarUrl: user.avatar_url,
      bio: user.bio,
      discordUsername: user.discord_username,
      timezone: user.timezone,
      createdAt: user.createdAt,
      totalTrades,
      totalWishlistItems,
      totalVouches: stats.totalVouches,
      averageRating: stats.averageRating ? parseFloat(stats.averageRating.toFixed(1)) : 0
    });

  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Get user profile
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    // Get user with aggregated data
    const user = await User.findById(userId).select('-password_hash');
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Get trade count
    const totalTrades = await Trade.countDocuments({ user_id: userId });

    // Get vouch count and average rating
    const vouchStats = await Vouch.aggregate([
      { $match: { vouched_user_id: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          totalVouches: { $sum: 1 },
          averageRating: { $avg: '$rating' }
        }
      }
    ]);

    // Get recent vouches
    const vouches = await Vouch.find({ vouched_user_id: userId })
      .populate('given_by_user_id', 'username')
      .sort({ createdAt: -1 })
      .limit(5);

    const stats = vouchStats[0] || { totalVouches: 0, averageRating: 0 };

    // Get recent trades
    const recentTrades = await Trade.find({ user_id: userId })
      .populate('user_id', 'username')
      .sort({ createdAt: -1 })
      .limit(10);

    // Calculate success rate (assuming completed trades are successful)
    const completedTrades = await Trade.countDocuments({ 
      user_id: userId, 
      status: { $in: ['completed', 'active'] }
    });
    const successRate = totalTrades > 0 ? ((completedTrades / totalTrades) * 100).toFixed(1) : 0;

    res.json({
      _id: user._id,
      username: user.username,
      roblox_username: user.roblox_username,
      credibility_score: user.credibility_score,
      role: user.role,
      avatar_url: user.avatar_url,
      bio: user.bio,
      discord_username: user.discord_username,
      timezone: user.timezone,
      createdAt: user.createdAt,
      totalTrades,
      totalVouches: stats.totalVouches,
      averageRating: stats.averageRating ? parseFloat(stats.averageRating.toFixed(1)) : 0,
      successRate: parseFloat(successRate),
      recentTrades: recentTrades.map(trade => ({
        _id: trade._id,
        item_offered: trade.item_offered,
        item_requested: trade.item_requested,
        status: trade.status,
        createdAt: trade.createdAt
      })),
      vouches: vouches.map(vouch => ({
        _id: vouch._id,
        rating: vouch.rating,
        comment: vouch.comment,
        createdAt: vouch.createdAt,
        given_by: vouch.given_by_user_id.username
      }))
    });

  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Update user profile (protected)
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const { username, robloxUsername, bio, discordUsername, timezone } = req.body;
    const userId = req.user.userId;

    const updateData = {};
    if (username !== undefined) updateData.username = username;
    if (robloxUsername !== undefined) updateData.roblox_username = robloxUsername;
    if (bio !== undefined) updateData.bio = bio;
    if (discordUsername !== undefined) updateData.discord_username = discordUsername;
    if (timezone !== undefined) updateData.timezone = timezone;

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true })
      .select('-password_hash');

    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json({ 
      message: 'Profile updated successfully',
      user: {
        _id: updatedUser._id,
        username: updatedUser.username,
        roblox_username: updatedUser.roblox_username,
        bio: updatedUser.bio,
        discord_username: updatedUser.discord_username,
        timezone: updatedUser.timezone,
        avatar_url: updatedUser.avatar_url
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar (protected)
router.post('/avatar', authenticateToken, upload.single('avatar'), async (req, res) => {
  try {
    const userId = req.user.userId;
    const uploadedFile = req.file;

    if (!uploadedFile) {
      return res.status(400).json({ error: 'No avatar file provided' });
    }

    // Get current user to remove old avatar
    const user = await User.findById(userId);
    if (user && user.avatar_url) {
      const oldAvatarPath = user.avatar_url.replace('/uploads/', './uploads/');
      if (fs.existsSync(oldAvatarPath)) {
        fs.unlinkSync(oldAvatarPath);
      }
    }

    // Update user with new avatar URL
    const avatarUrl = `/uploads/avatars/${uploadedFile.filename}`;
    await User.findByIdAndUpdate(userId, { avatar_url: avatarUrl });

    res.json({
      message: 'Avatar uploaded successfully',
      avatar_url: avatarUrl
    });

  } catch (error) {
    console.error('Upload avatar error:', error);
    
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'Avatar file too large. Maximum 2MB allowed.' });
    }
    if (error.message === 'Only image files are allowed for avatars') {
      return res.status(400).json({ error: 'Only image files are allowed for avatars' });
    }
    
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Get user's wishlist

// Get user's wishlist
router.get('/:userId/wishlist', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const wishlistItems = await Wishlist.find({ user_id: userId })
      .sort({ createdAt: -1 });

    res.json(wishlistItems.map(item => ({
      wishlist_id: item._id,
      item_name: item.item_name,
      created_at: item.createdAt
    })));

  } catch (error) {
    console.error('Get wishlist error:', error);
    res.status(500).json({ error: 'Failed to get wishlist' });
  }
});

// Add item to wishlist (protected)
router.post('/wishlist', authenticateToken, async (req, res) => {
  try {
    const { itemName } = req.body;
    const userId = req.user.userId;

    if (!itemName) {
      return res.status(400).json({ error: 'Item name is required' });
    }

    const newWishlistItem = new Wishlist({
      user_id: userId,
      item_name: itemName
    });

    const savedItem = await newWishlistItem.save();

    res.status(201).json({
      message: 'Item added to wishlist',
      wishlistId: savedItem._id
    });

  } catch (error) {
    console.error('Add to wishlist error:', error);
    res.status(500).json({ error: 'Failed to add item to wishlist' });
  }
});

// Remove item from wishlist (protected)
router.delete('/wishlist/:wishlistId', authenticateToken, async (req, res) => {
  try {
    const { wishlistId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(wishlistId)) {
      return res.status(400).json({ error: 'Invalid wishlist ID' });
    }

    const result = await Wishlist.findOneAndDelete({
      _id: wishlistId,
      user_id: userId
    });

    if (!result) {
      return res.status(404).json({ error: 'Wishlist item not found' });
    }

    res.json({ message: 'Item removed from wishlist' });

  } catch (error) {
    console.error('Remove from wishlist error:', error);
    res.status(500).json({ error: 'Failed to remove item from wishlist' });
  }
});

// Search users
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const limit = parseInt(req.query.limit) || 10;
    
    if (!query || query.length < 2) {
      return res.status(400).json({ error: 'Search query must be at least 2 characters' });
    }

    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { roblox_username: { $regex: query, $options: 'i' } }
      ]
    })
    .select('username roblox_username credibility_score avatar_url role createdAt')
    .limit(limit)
    .sort({ credibility_score: -1 });

    res.json(users.map(user => ({
      _id: user._id,
      username: user.username,
      roblox_username: user.roblox_username,
      credibility_score: user.credibility_score,
      avatar_url: user.avatar_url,
      role: user.role,
      createdAt: user.createdAt
    })));

  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({ error: 'Failed to search users' });
  }
});

export default router;