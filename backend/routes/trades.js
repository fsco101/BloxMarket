import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { tradeController } from '../controllers/tradeController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';

// Configure multer for image uploads using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bloxmarket/trades',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});

const fileFilter = (req, file, cb) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: fileFilter
});

// Trade routes
router.get('/', tradeController.getAllTrades);
router.post('/', authenticateToken, upload.array('images', 5), tradeController.createTrade);
router.get('/:tradeId', tradeController.getTradeById);
router.patch('/:tradeId', authenticateToken, upload.array('images', 5), tradeController.updateTrade);
// Add PUT alias so older clients don't 404
router.put('/:tradeId', authenticateToken, tradeController.updateTrade);
router.delete('/:tradeId', authenticateToken, tradeController.deleteTrade);

// Comment routes
router.get('/:tradeId/comments', tradeController.getTradeComments);
router.post('/:tradeId/comments', authenticateToken, tradeController.addTradeComment);

// Vote routes
router.get('/:tradeId/votes', tradeController.getTradeVotes);
router.post('/:tradeId/vote', authenticateToken, tradeController.voteOnTrade);

export default router;