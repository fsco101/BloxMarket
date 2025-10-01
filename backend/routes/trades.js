import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Trade } from '../models/Trade.js';
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

    res.json({
      trades: trades.map(trade => ({
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

export default router;