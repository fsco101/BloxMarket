import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['giveaway', 'competition', 'event'],
    default: 'event'
  },
  status: {
    type: String,
    enum: ['active', 'ended', 'upcoming'],
    default: 'upcoming'
  },
  prizes: [{
    type: String
  }],
  requirements: [{
    type: String
  }],
  maxParticipants: {
    type: Number
  },
  participantCount: {
    type: Number,
    default: 0
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  start_date: {
    type: Date
  },
  end_date: {
    type: Date
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Virtual to determine status based on dates
eventSchema.virtual('computedStatus').get(function() {
  const now = new Date();
  if (this.end_date && now > this.end_date) {
    return 'ended';
  }
  if (this.start_date && now < this.start_date) {
    return 'upcoming';
  }
  return 'active';
});

// Update status before saving
eventSchema.pre('save', function() {
  if (this.isNew || this.isModified('start_date') || this.isModified('end_date')) {
    this.status = this.computedStatus;
  }
});

export const Event = mongoose.model('Event', eventSchema);