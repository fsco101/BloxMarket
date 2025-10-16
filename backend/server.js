// Load env FIRST (move to the very top, before any other imports)
import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import tradeRoutes from './routes/trades.js';
import forumRoutes from './routes/forum.js';
import eventRoutes from './routes/events.js';
import adminRoutes from './routes/admin.js';
import uploadsRoutes from './routes/uploads.js';
import userDatatableRoutes from './routes/datatables/userDatatableRoutes.js';
import eventsDatatableRoutes from './routes/datatables/eventsDatatableRoutes.js';
import forumDatatableRoutes from './routes/datatables/forumDatatableRoutes.js';
import tradingPostDatatableRoutes from './routes/datatables/tradingPostDatatableRoutes.js';

// Import wishlist routes
import wishlistRoutes from './routes/wishlist.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Static file serving for uploads
// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure upload directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const tradesDir = path.join(uploadsDir, 'trades');
const forumDir = path.join(uploadsDir, 'forum');
const wishlistsDir = path.join(uploadsDir, 'wishlists');
const avatarsDir = path.join(uploadsDir, 'avatars');
const eventDir = path.join(uploadsDir, 'event');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(tradesDir)) {
  fs.mkdirSync(tradesDir, { recursive: true });
}
if (!fs.existsSync(forumDir)) {
  fs.mkdirSync(forumDir, { recursive: true });
}
if (!fs.existsSync(wishlistsDir)) {
  fs.mkdirSync(wishlistsDir, { recursive: true });
}
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
}
if (!fs.existsSync(eventDir)) {
  fs.mkdirSync(eventDir, { recursive: true });
}

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/bloxmarket';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

// Connect to database
connectToDatabase();

// Remove this custom CORS middleware as we're using the cors package above

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/forum', forumRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/uploads', uploadsRoutes);
app.use('/api/admin/datatables', userDatatableRoutes);
app.use('/api/wishlists', wishlistRoutes); // Add this line

// Admin DataTable Routes
app.use('/api/admin/datatables/users', userDatatableRoutes);
app.use('/api/admin/datatables/events', eventsDatatableRoutes);
app.use('/api/admin/datatables/forum', forumDatatableRoutes);
app.use('/api/admin/datatables/trading-posts', tradingPostDatatableRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🍃 Database: ${MONGODB_URI.includes('localhost') ? 'Local MongoDB' : 'Remote MongoDB'}`);
});