import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Trade, TradeComment, TradeRating, TradeVote } from '../models/Trade.js';
import { User } from '../models/User.js';
import { authenticateToken } from './auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Create uploads directory if it doesn't exist
const uploadsDir = 'uploads/trades';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'trade-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit per file
    files: 5 // Maximum 5 files
  }
});

// Serve uploaded images
router.use('/images', express.static(uploadsDir));

// Upload images endpoint (protected) - for preview before creating trade
router.post('/upload-images', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const uploadedFiles = req.files;

    if (!uploadedFiles || uploadedFiles.length === 0) {
      return res.status(400).json({ error: 'No images uploaded' });
    }

    const imageUrls = uploadedFiles.map(file => ({
      filename: file.filename,
      url: `/api/trades/images/${file.filename}`,
      size: file.size,
      originalName: file.originalname
    }));

    res.json({
      message: 'Images uploaded successfully',
      images: imageUrls
    });

  } catch (error) {
    console.error('Upload images error:', error);
    
    // Clean up uploaded files if error occurs
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum 5MB per file.' });
      } else if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum 5 images allowed.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to upload images' });
  }
});

// Delete uploaded image (protected)
router.delete('/images/:filename', authenticateToken, async (req, res) => {
  try {
    const { filename } = req.params;
    const filePath = path.join(uploadsDir, filename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }

    // Delete the file
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Error deleting file:', err);
        return res.status(500).json({ error: 'Failed to delete image' });
      }
      
      res.json({ message: 'Image deleted successfully' });
    });

  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// Get all trades with pagination
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = {};
    if (status) {
      query.status = status;
    }

    const trades = await Trade.find(query)
      .populate('user_id', 'username roblox_username credibility_score')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalTrades = await Trade.countDocuments(query);

    // For each trade, add comment and vote counts
    const tradesWithCounts = await Promise.all(trades.map(async (trade) => {
      const [commentCount, upvotes, downvotes] = await Promise.all([
        TradeComment.countDocuments({ trade_id: trade._id }),
        TradeVote.countDocuments({ trade_id: trade._id, vote_type: 'up' }),
        TradeVote.countDocuments({ trade_id: trade._id, vote_type: 'down' })
      ]);

      return {
        ...trade.toObject(),
        comment_count: commentCount,
        upvotes,
        downvotes
      };
    }));

    res.json({
      trades: tradesWithCounts.map(trade => ({
        trade_id: trade._id,
        item_offered: trade.item_offered,
        item_requested: trade.item_requested,
        description: trade.description,
        status: trade.status,
        created_at: trade.createdAt,
        username: trade.user_id.username,
        roblox_username: trade.user_id.roblox_username,
        credibility_score: trade.user_id.credibility_score,
        user_id: trade.user_id._id,
        images: trade.images || []
      })),
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalTrades / limit),
        totalTrades,
        hasNext: page < Math.ceil(totalTrades / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get trades error:', error);
    res.status(500).json({ error: 'Failed to get trades' });
  }
});

// Get single trade
router.get('/:tradeId', async (req, res) => {
  try {
    const { tradeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    const trade = await Trade.findById(tradeId)
      .populate('user_id', 'username roblox_username credibility_score');

    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    res.json({
      trade_id: trade._id,
      item_offered: trade.item_offered,
      item_requested: trade.item_requested,
      description: trade.description,
      status: trade.status,
      created_at: trade.createdAt,
      username: trade.user_id.username,
      roblox_username: trade.user_id.roblox_username,
      credibility_score: trade.user_id.credibility_score,
      user_id: trade.user_id._id,
      images: trade.images
    });

  } catch (error) {
    console.error('Get trade error:', error);
    res.status(500).json({ error: 'Failed to get trade' });
  }
});

// Create new trade (protected)
router.post('/', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { itemOffered, itemRequested, description } = req.body;
    const userId = req.user.userId;
    const uploadedFiles = req.files;

    if (!itemOffered) {
      return res.status(400).json({ error: 'Item offered is required' });
    }

    // Process uploaded images
    const images = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        images.push({
          image_url: `/api/trades/images/${file.filename}`,
          uploaded_at: new Date()
        });
      }
    }

    const newTrade = new Trade({
      user_id: userId,
      item_offered: itemOffered,
      item_requested: itemRequested || undefined,
      description: description || undefined,
      images: images
    });

    const savedTrade = await newTrade.save();

    res.status(201).json({
      message: 'Trade created successfully',
      tradeId: savedTrade._id,
      imagesUploaded: images.length
    });

  } catch (error) {
    console.error('Create trade error:', error);
    
    // Clean up uploaded files if trade creation fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum 5MB per file.' });
      } else if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum 5 images allowed.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to create trade' });
  }
});

// Update trade (protected)
router.put('/:tradeId', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { itemOffered, itemRequested, description } = req.body;
    const userId = req.user.userId;
    const uploadedFiles = req.files;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    if (!itemOffered) {
      return res.status(400).json({ error: 'Item offered is required' });
    }

    // Check if user owns the trade
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (!trade.user_id.equals(userId)) {
      return res.status(403).json({ error: 'Not authorized to update this trade' });
    }

    // Process uploaded images if any
    const newImages = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      for (const file of uploadedFiles) {
        newImages.push({
          image_url: `/api/trades/images/${file.filename}`,
          uploaded_at: new Date()
        });
      }
    }

    // Update trade data
    const updateData = {
      item_offered: itemOffered,
      item_requested: itemRequested || undefined,
      description: description || undefined,
      updatedAt: new Date()
    };

    // If new images are uploaded, replace the existing ones
    if (newImages.length > 0) {
      // Delete old images from filesystem
      if (trade.images && trade.images.length > 0) {
        trade.images.forEach(image => {
          const filename = path.basename(image.image_url);
          const filePath = path.join(uploadsDir, filename);
          if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
              if (err) console.error('Error deleting old image:', err);
            });
          }
        });
      }
      updateData.images = newImages;
    }

    await Trade.findByIdAndUpdate(tradeId, updateData);

    res.json({ 
      message: 'Trade updated successfully',
      imagesUploaded: newImages.length
    });

  } catch (error) {
    console.error('Update trade error:', error);
    
    // Clean up uploaded files if trade update fails
    if (req.files) {
      req.files.forEach(file => {
        fs.unlink(file.path, (err) => {
          if (err) console.error('Error deleting file:', err);
        });
      });
    }
    
    if (error instanceof multer.MulterError) {
      if (error.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File size too large. Maximum 5MB per file.' });
      } else if (error.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).json({ error: 'Too many files. Maximum 5 images allowed.' });
      }
    }
    
    res.status(500).json({ error: 'Failed to update trade' });
  }
});

// Update trade status (protected)
router.put('/:tradeId/status', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Check if user owns the trade or is admin/moderator
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (!trade.user_id.equals(userId)) {
      // Check if user is admin/moderator
      const user = await User.findById(userId);
      if (!user || !['admin', 'moderator'].includes(user.role)) {
        return res.status(403).json({ error: 'Not authorized to update this trade' });
      }
    }

    await Trade.findByIdAndUpdate(tradeId, { status });

    res.json({ message: 'Trade status updated successfully' });

  } catch (error) {
    console.error('Update trade status error:', error);
    res.status(500).json({ error: 'Failed to update trade status' });
  }
});

// Delete trade (protected)
router.delete('/:tradeId', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    // Check if user owns the trade or is admin/moderator
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    if (!trade.user_id.equals(userId)) {
      // Check if user is admin/moderator
      const user = await User.findById(userId);
      if (!user || !['admin', 'moderator'].includes(user.role)) {
        return res.status(403).json({ error: 'Not authorized to delete this trade' });
      }
    }

    await Trade.findByIdAndDelete(tradeId);

    res.json({ message: 'Trade deleted successfully' });

  } catch (error) {
    console.error('Delete trade error:', error);
    res.status(500).json({ error: 'Failed to delete trade' });
  }
});

// Get user's trades
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const trades = await Trade.find({ user_id: userId })
      .sort({ createdAt: -1 });

    res.json(trades.map(trade => ({
      trade_id: trade._id,
      item_offered: trade.item_offered,
      item_requested: trade.item_requested,
      description: trade.description,
      status: trade.status,
      created_at: trade.createdAt
    })));

  } catch (error) {
    console.error('Get user trades error:', error);
    res.status(500).json({ error: 'Failed to get user trades' });
  }
});

// Update trade status (protected)
router.patch('/:tradeId/status', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { status } = req.body;
    const userId = req.user.userId;

    // Validate MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    // Validate status
    const validStatuses = ['open', 'in_progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    // Find the trade using MongoDB _id, not trade_id field
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Check if user owns the trade or is admin/moderator
    const user = await User.findById(userId);
    const canUpdate = trade.user_id.equals(userId) || 
                      user.role === 'admin' || 
                      user.role === 'moderator';

    if (!canUpdate) {
      return res.status(403).json({ error: 'You can only update your own trades' });
    }

    // Update the trade status
    trade.status = status;
    trade.updatedAt = new Date();
    
    await trade.save();

    res.json({ 
      message: 'Trade status updated successfully',
      trade: {
        trade_id: trade._id,
        status: trade.status,
        updated_at: trade.updatedAt
      }
    });
  } catch (error) {
    console.error('Update trade status error:', error);
    res.status(500).json({ error: 'Failed to update trade status' });
  }
});

// Get trade comments
router.get('/:tradeId/comments', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    // Check if trade exists
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Get comments for this trade
    const comments = await TradeComment.find({ trade_id: tradeId })
      .populate('user_id', 'username credibility_score')
      .sort({ createdAt: -1 })
      .lean();

    const formattedComments = comments.map(comment => ({
      comment_id: comment._id,
      trade_id: comment.trade_id,
      content: comment.content,
      created_at: comment.createdAt,
      username: comment.user_id.username,
      credibility_score: comment.user_id.credibility_score
    }));

    res.json({
      comments: formattedComments
    });

  } catch (error) {
    console.error('Get trade comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add trade comment
router.post('/:tradeId/comments', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    console.log('Add comment request:', { tradeId, content, userId });

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if trade exists
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Create comment
    const comment = new TradeComment({
      trade_id: tradeId,
      user_id: userId,
      content: content.trim()
    });

    await comment.save();
    console.log('Comment saved:', comment._id);

    // Populate user data
    await comment.populate('user_id', 'username credibility_score');

    const responseData = {
      comment_id: comment._id,
      trade_id: comment.trade_id,
      content: comment.content,
      created_at: comment.createdAt,
      username: comment.user_id.username,
      credibility_score: comment.user_id.credibility_score
    };

    console.log('Comment response:', responseData);

    res.status(201).json(responseData);

  } catch (error) {
    console.error('Add trade comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Get trade rating
router.get('/:tradeId/rating', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    // Check if trade exists
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Get total likes for this trade
    const totalLikes = await TradeRating.countDocuments({
      trade_id: tradeId,
      rating_type: 'like'
    });

    // Check if current user has liked this trade
    const userRating = await TradeRating.findOne({
      trade_id: tradeId,
      user_id: userId,
      rating_type: 'like'
    });

    res.json({
      likes: totalLikes,
      userLiked: !!userRating
    });

  } catch (error) {
    console.error('Get trade rating error:', error);
    res.status(500).json({ error: 'Failed to fetch rating' });
  }
});

// Toggle trade like
router.post('/:tradeId/like', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user.userId;

    console.log('Toggle like request:', { tradeId, userId });

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    // Check if trade exists
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Check if user has already liked this trade
    const existingRating = await TradeRating.findOne({
      trade_id: tradeId,
      user_id: userId,
      rating_type: 'like'
    });

    let userLiked = false;

    if (existingRating) {
      // Remove like
      await TradeRating.deleteOne({ _id: existingRating._id });
      console.log('Like removed');
    } else {
      // Add like
      const newRating = new TradeRating({
        trade_id: tradeId,
        user_id: userId,
        rating_type: 'like'
      });
      
      await newRating.save();
      userLiked = true;
      console.log('Like added');
    }

    // Get updated total likes
    const totalLikes = await TradeRating.countDocuments({
      trade_id: tradeId,
      rating_type: 'like'
    });

    console.log('Final like count:', { totalLikes, userLiked });

    res.json({
      message: 'Like updated successfully',
      likes: totalLikes,
      userLiked
    });

  } catch (error) {
    console.error('Toggle trade like error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already rated this trade' });
    }
    
    res.status(500).json({ error: 'Failed to update like' });
  }
});

// Get trade votes
router.get('/:tradeId/votes', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    // Check if trade exists
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Get total votes for this trade
    const [upvotes, downvotes] = await Promise.all([
      TradeVote.countDocuments({ trade_id: tradeId, vote_type: 'up' }),
      TradeVote.countDocuments({ trade_id: tradeId, vote_type: 'down' })
    ]);

    // Check if current user has voted on this trade
    const userVote = await TradeVote.findOne({
      trade_id: tradeId,
      user_id: userId
    });

    res.json({
      upvotes,
      downvotes,
      userVote: userVote ? userVote.vote_type : null
    });

  } catch (error) {
    console.error('Get trade votes error:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Vote on trade
router.post('/:tradeId/vote', authenticateToken, async (req, res) => {
  try {
    const { tradeId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.userId;

    console.log('Trade vote request:', { tradeId, voteType, userId });

    if (!mongoose.Types.ObjectId.isValid(tradeId)) {
      return res.status(400).json({ error: 'Invalid trade ID' });
    }

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Must be "up" or "down"' });
    }

    // Check if trade exists
    const trade = await Trade.findById(tradeId);
    if (!trade) {
      return res.status(404).json({ error: 'Trade not found' });
    }

    // Check for existing vote
    const existingVote = await TradeVote.findOne({
      trade_id: tradeId,
      user_id: userId
    });

    let userVote = null;

    if (existingVote) {
      // User has already voted
      if (existingVote.vote_type === voteType) {
        // Same vote type - remove the vote
        await TradeVote.deleteOne({ _id: existingVote._id });
        console.log('Vote removed');
      } else {
        // Different vote type - change the vote
        existingVote.vote_type = voteType;
        await existingVote.save();
        userVote = voteType;
        console.log('Vote changed to:', voteType);
      }
    } else {
      // New vote
      const newVote = new TradeVote({
        trade_id: tradeId,
        user_id: userId,
        vote_type: voteType
      });
      
      await newVote.save();
      userVote = voteType;
      console.log('New vote added:', voteType);
    }

    // Get updated vote counts
    const [upvotes, downvotes] = await Promise.all([
      TradeVote.countDocuments({ trade_id: tradeId, vote_type: 'up' }),
      TradeVote.countDocuments({ trade_id: tradeId, vote_type: 'down' })
    ]);

    console.log('Final vote counts:', { upvotes, downvotes, userVote });

    res.json({
      message: 'Vote updated successfully',
      upvotes,
      downvotes,
      userVote
    });

  } catch (error) {
    console.error('Trade vote error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already voted on this trade' });
    }
    
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

export default router;