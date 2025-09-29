import express from 'express';
import { ForumPost, ForumComment } from '../models/Forum.js';
import { User } from '../models/User.js';
import { authenticateToken } from './auth.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const router = express.Router();

// Configure multer for forum image uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const dir = './uploads/forum';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'forum-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 images per post
  },
  fileFilter: function (req, file, cb) {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Get forum posts with pagination
router.get('/posts', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const category = req.query.category;
    const skip = (page - 1) * limit;

    let query = {};
    if (category) {
      query.category = category;
    }

    const posts = await ForumPost.find(query)
      .populate('user_id', 'username credibility_score')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get comment counts for each post
    const postsWithComments = await Promise.all(
      posts.map(async (post) => {
        const commentCount = await ForumComment.countDocuments({ post_id: post._id });
        return {
          post_id: post._id,
          title: post.title,
          content: post.content,
          category: post.category,
          upvotes: post.upvotes,
          downvotes: post.downvotes,
          created_at: post.createdAt,
          username: post.user_id.username,
          credibility_score: post.user_id.credibility_score,
          images: post.images || [],
          commentCount
        };
      })
    );

    res.json(postsWithComments);

  } catch (error) {
    console.error('Get forum posts error:', error);
    res.status(500).json({ error: 'Failed to get forum posts' });
  }
});

// Get single forum post with comments
router.get('/posts/:postId', async (req, res) => {
  try {
    const { postId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Get post
    const post = await ForumPost.findById(postId)
      .populate('user_id', 'username credibility_score');

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Get comments
    const comments = await ForumComment.find({ post_id: postId })
      .populate('user_id', 'username credibility_score')
      .sort({ createdAt: 1 });

    res.json({
      post_id: post._id,
      title: post.title,
      content: post.content,
      category: post.category,
      upvotes: post.upvotes,
      downvotes: post.downvotes,
      created_at: post.createdAt,
      username: post.user_id.username,
      credibility_score: post.user_id.credibility_score,
      user_id: post.user_id._id,
      images: post.images || [],
      comments: comments.map(comment => ({
        comment_id: comment._id,
        content: comment.content,
        created_at: comment.createdAt,
        username: comment.user_id.username,
        credibility_score: comment.user_id.credibility_score
      }))
    });

  } catch (error) {
    console.error('Get forum post error:', error);
    res.status(500).json({ error: 'Failed to get forum post' });
  }
});

// Create forum post (protected)
router.post('/posts', authenticateToken, upload.array('images', 5), async (req, res) => {
  try {
    const { title, content, category } = req.body;
    const userId = req.user.userId;
    const uploadedFiles = req.files;

    if (!title || !content) {
      // Clean up uploaded files if validation fails
      if (uploadedFiles && uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const validCategories = ['trading_tips', 'scammer_reports', 'game_updates', 'general'];
    if (category && !validCategories.includes(category)) {
      // Clean up uploaded files if validation fails
      if (uploadedFiles && uploadedFiles.length > 0) {
        uploadedFiles.forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      return res.status(400).json({ error: 'Invalid category' });
    }

    // Process uploaded images
    const images = [];
    if (uploadedFiles && uploadedFiles.length > 0) {
      uploadedFiles.forEach(file => {
        images.push({
          filename: file.filename,
          originalName: file.originalname,
          path: file.path,
          size: file.size,
          mimetype: file.mimetype
        });
      });
    }

    const newPost = new ForumPost({
      user_id: userId,
      title,
      content,
      category: category || 'general',
      images: images
    });

    const savedPost = await newPost.save();

    res.status(201).json({
      message: 'Post created successfully',
      postId: savedPost._id,
      imagesUploaded: images.length
    });

  } catch (error) {
    console.error('Create forum post error:', error);
    
    // Clean up uploaded files on error
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        if (fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
        }
      });
    }
    
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'File size too large. Maximum 5MB per image.' });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({ error: 'Too many files. Maximum 5 images per post.' });
    }
    if (error.message === 'Only image files are allowed') {
      return res.status(400).json({ error: 'Only image files are allowed' });
    }
    
    res.status(500).json({ error: 'Failed to create forum post' });
  }
});

// Add comment to post (protected)
router.post('/posts/:postId/comments', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if post exists
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    const newComment = new ForumComment({
      post_id: postId,
      user_id: userId,
      content
    });

    const savedComment = await newComment.save();

    res.status(201).json({
      message: 'Comment added successfully',
      commentId: savedComment._id
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

// Delete forum post (protected)
router.delete('/posts/:postId', authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(postId)) {
      return res.status(400).json({ error: 'Invalid post ID' });
    }

    // Check if user owns the post or is admin/moderator
    const post = await ForumPost.findById(postId);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (!post.user_id.equals(userId)) {
      // Check if user is admin/moderator
      const user = await User.findById(userId);
      if (!user || !['admin', 'moderator'].includes(user.role)) {
        return res.status(403).json({ error: 'Not authorized to delete this post' });
      }
    }

    // Delete post and its comments
    await ForumComment.deleteMany({ post_id: postId });
    await ForumPost.findByIdAndDelete(postId);

    res.json({ message: 'Post deleted successfully' });

  } catch (error) {
    console.error('Delete forum post error:', error);
    res.status(500).json({ error: 'Failed to delete forum post' });
  }
});

export default router;