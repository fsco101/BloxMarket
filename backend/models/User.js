import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    maxlength: 50
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    maxlength: 100
  },
  password_hash: {
    type: String,
    required: true
  },
  roblox_username: {
    type: String,
    trim: true,
    maxlength: 50
  },
  avatar_url: {
    type: String,
    trim: true
  },
  credibility_score: {
    type: Number,
    default: 0
  },
  role: {
    type: String,
    enum: ['user', 'verified', 'middleman', 'admin', 'moderator', 'banned'],
    default: 'user'
  },
  bio: {
    type: String,
    trim: true,
    maxlength: 500
  },
  discord_username: {
    type: String,
    trim: true,
    maxlength: 50
  },
  timezone: {
    type: String,
    trim: true,
    maxlength: 50
  },
  verification_requested: {
    type: Boolean,
    default: false
  },
  middleman_requested: {
    type: Boolean,
    default: false
  },
  ban_reason: {
    type: String,
    trim: true
  },
  banned_at: {
    type: Date
  },
  lastLogin: {
    type: Date,
    default: Date.now
  },
  tokens: [{
    token: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const User = mongoose.model('User', userSchema);