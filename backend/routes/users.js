import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { userController } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';

// Configure multer for avatar uploads using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bloxmarket/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
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

// User routes
router.get('/me', authenticateToken, userController.getCurrentUserProfile);
router.get('/:userId', userController.getUserById);
router.get('/search/:query', userController.searchUsers);
router.patch('/me', authenticateToken, userController.updateProfile);
router.post('/avatar', authenticateToken, upload.single('avatar'), userController.uploadAvatar);
router.get('/:userId/wishlist', userController.getUserWishlist);
router.post('/wishlist', authenticateToken, userController.addToWishlist);
router.delete('/wishlist/:wishlistId', authenticateToken, userController.removeFromWishlist);
router.post('/request-verification', authenticateToken, userController.requestVerification);
router.post('/request-middleman', authenticateToken, userController.requestMiddleman);

export default router;