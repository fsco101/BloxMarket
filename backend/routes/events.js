import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { eventController } from '../controllers/eventController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { cloudinary } from '../config/cloudinary.js';

// Configure multer for event image uploads using Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'bloxmarket/events',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp']
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'));
    }
    
    // Check file extension
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const fileExtension = path.extname(file.originalname).toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
      return cb(new Error('Invalid file extension'));
    }
    
    cb(null, true);
  }
});

// Event routes
router.get('/', eventController.getAllEvents);
router.get('/:eventId', eventController.getEventById);
router.post('/', authenticateToken, upload.array('images', 5), eventController.createEvent);
router.put('/:eventId', authenticateToken, upload.array('images', 5), eventController.updateEvent);
router.delete('/:eventId', authenticateToken, eventController.deleteEvent);

// Event interaction routes
router.post('/:eventId/join', authenticateToken, eventController.joinEvent);
router.get('/:eventId/votes', authenticateToken, eventController.getEventVotes);
router.post('/:eventId/vote', authenticateToken, eventController.voteOnEvent);

// Comment routes
router.get('/:eventId/comments', authenticateToken, eventController.getEventComments);
router.post('/:eventId/comments', authenticateToken, eventController.addEventComment);

// Serve event images
router.get('/images/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    
    // Sanitize filename to prevent path traversal
    const sanitizedFilename = path.basename(filename);
    const filepath = path.join(process.cwd(), 'uploads', 'event', sanitizedFilename);
    
    // Check if file exists
    if (!fs.existsSync(filepath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Determine content type based on file extension
    const ext = path.extname(sanitizedFilename).toLowerCase();
    let contentType = 'image/jpeg'; // default
    
    switch (ext) {
      case '.png':
        contentType = 'image/png';
        break;
      case '.gif':
        contentType = 'image/gif';
        break;
      case '.webp':
        contentType = 'image/webp';
        break;
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      default:
        return res.status(400).json({ error: 'Unsupported file type' });
    }
    
    // Set headers
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 24 hours cache
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Send file
    res.sendFile(filepath);
    
  } catch (error) {
    console.error('Serve event image error:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

export default router;