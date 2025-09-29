import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item_name: {
    type: String,
    required: true,
    trim: true
  }
}, {
  timestamps: true
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);