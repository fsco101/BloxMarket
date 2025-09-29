import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  item_offered: {
    type: String,
    required: true,
    trim: true
  },
  item_requested: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'completed', 'cancelled'],
    default: 'open'
  },
  images: [{
    image_url: {
      type: String,
      required: true
    },
    uploaded_at: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

export const Trade = mongoose.model('Trade', tradeSchema);