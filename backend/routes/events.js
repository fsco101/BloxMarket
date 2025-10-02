import express from 'express';
import { Event } from '../models/Event.js';
import { User } from '../models/User.js';
import { authenticateToken } from './auth.js';
import mongoose from 'mongoose';

const router = express.Router();

// Get all events
router.get('/', async (req, res) => {
  try {
    const events = await Event.find()
      .populate('created_by', 'username avatar verified')
      .sort({ start_date: -1 });

    // Update status for all events based on current date
    const now = new Date();
    const updatedEvents = events.map(event => {
      let computedStatus = 'active';
      if (event.end_date && now > event.end_date) {
        computedStatus = 'ended';
      } else if (event.start_date && now < event.start_date) {
        computedStatus = 'upcoming';
      }
      
      // Check if ending soon (within 24 hours)
      if (event.end_date && computedStatus === 'active') {
        const timeUntilEnd = event.end_date.getTime() - now.getTime();
        const hoursUntilEnd = timeUntilEnd / (1000 * 60 * 60);
        if (hoursUntilEnd <= 24 && hoursUntilEnd > 0) {
          computedStatus = 'ending-soon';
        }
      }

      return {
        _id: event._id,
        title: event.title,
        description: event.description,
        type: event.type || 'event',
        status: computedStatus,
        prizes: event.prizes || [],
        requirements: event.requirements || [],
        maxParticipants: event.maxParticipants,
        participantCount: event.participantCount || 0,
        startDate: event.start_date,
        endDate: event.end_date,
        creator: {
          username: event.created_by?.username || 'Unknown',
          avatar: event.created_by?.avatar,
          verified: event.created_by?.verified || false
        },
        createdAt: event.createdAt
      };
    });

    res.json(updatedEvents);

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to get events' });
  }
});

// Get single event
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId)
      .populate('created_by', 'username avatar verified')
      .populate('participants', 'username avatar');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update status based on current date
    const now = new Date();
    let computedStatus = 'active';
    if (event.end_date && now > event.end_date) {
      computedStatus = 'ended';
    } else if (event.start_date && now < event.start_date) {
      computedStatus = 'upcoming';
    }
    
    // Check if ending soon (within 24 hours)
    if (event.end_date && computedStatus === 'active') {
      const timeUntilEnd = event.end_date.getTime() - now.getTime();
      const hoursUntilEnd = timeUntilEnd / (1000 * 60 * 60);
      if (hoursUntilEnd <= 24 && hoursUntilEnd > 0) {
        computedStatus = 'ending-soon';
      }
    }

    res.json({
      _id: event._id,
      title: event.title,
      description: event.description,
      type: event.type || 'event',
      status: computedStatus,
      prizes: event.prizes || [],
      requirements: event.requirements || [],
      maxParticipants: event.maxParticipants,
      participantCount: event.participantCount || 0,
      startDate: event.start_date,
      endDate: event.end_date,
      creator: {
        username: event.created_by?.username || 'Unknown',
        avatar: event.created_by?.avatar,
        verified: event.created_by?.verified || false
      },
      participants: event.participants || [],
      createdAt: event.createdAt
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create event (protected)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      type, 
      prizes, 
      requirements, 
      maxParticipants 
    } = req.body;
    const userId = req.user.userId;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Determine initial status based on dates
    const now = new Date();
    let status = 'upcoming';
    if (startDate) {
      const start = new Date(startDate);
      if (now >= start) {
        status = 'active';
      }
    } else {
      status = 'active'; // If no start date, consider it active
    }

    const newEvent = new Event({
      title,
      description: description || undefined,
      type: type || 'event',
      status,
      prizes: prizes || [],
      requirements: requirements || [],
      maxParticipants: maxParticipants || undefined,
      start_date: startDate ? new Date(startDate) : undefined,
      end_date: endDate ? new Date(endDate) : undefined,
      created_by: userId
    });

    const savedEvent = await newEvent.save();

    res.status(201).json({
      message: 'Event created successfully',
      eventId: savedEvent._id
    });

  } catch (error) {
    console.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
});

// Update event (protected - creator, admin, or moderator only)
router.put('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { 
      title, 
      description, 
      startDate, 
      endDate, 
      type, 
      prizes, 
      requirements, 
      maxParticipants 
    } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator, admin, or moderator
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCreator = event.created_by.toString() === userId;
    const isAdminOrMod = ['admin', 'moderator'].includes(user.role);

    if (!isCreator && !isAdminOrMod) {
      return res.status(403).json({ error: 'Only the creator, admins, or moderators can update this event' });
    }

    // Determine status based on dates
    const now = new Date();
    let status = event.status;
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : event.start_date;
      const end = endDate ? new Date(endDate) : event.end_date;
      
      if (end && now > end) {
        status = 'ended';
      } else if (start && now < start) {
        status = 'upcoming';
      } else {
        status = 'active';
      }
    }

    await Event.findByIdAndUpdate(eventId, {
      title: title || event.title,
      description: description !== undefined ? description : event.description,
      type: type || event.type,
      status,
      prizes: prizes !== undefined ? prizes : event.prizes,
      requirements: requirements !== undefined ? requirements : event.requirements,
      maxParticipants: maxParticipants !== undefined ? maxParticipants : event.maxParticipants,
      start_date: startDate ? new Date(startDate) : event.start_date,
      end_date: endDate ? new Date(endDate) : event.end_date
    });

    res.json({ message: 'Event updated successfully' });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Join event (protected)
router.post('/:eventId/join', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if event is still active/upcoming
    if (event.status === 'ended') {
      return res.status(400).json({ error: 'Cannot join ended event' });
    }

    // Check if user is already a participant
    if (event.participants.includes(userId)) {
      return res.status(400).json({ error: 'Already joined this event' });
    }

    // Check max participants limit
    if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      return res.status(400).json({ error: 'Event is full' });
    }

    // Add user to participants and increment count
    await Event.findByIdAndUpdate(eventId, {
      $push: { participants: userId },
      $inc: { participantCount: 1 }
    });

    res.json({ message: 'Successfully joined event' });

  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// Leave event (protected)
router.post('/:eventId/leave', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is a participant
    if (!event.participants.includes(userId)) {
      return res.status(400).json({ error: 'Not a participant in this event' });
    }

    // Remove user from participants and decrement count
    await Event.findByIdAndUpdate(eventId, {
      $pull: { participants: userId },
      $inc: { participantCount: -1 }
    });

    res.json({ message: 'Successfully left event' });

  } catch (error) {
    console.error('Leave event error:', error);
    res.status(500).json({ error: 'Failed to leave event' });
  }
});

// Delete event (protected - creator, admin, or moderator only)
router.delete('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check if user is the creator, admin, or moderator
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isCreator = event.created_by.toString() === userId;
    const isAdminOrMod = ['admin', 'moderator'].includes(user.role);

    if (!isCreator && !isAdminOrMod) {
      return res.status(403).json({ error: 'Only the creator, admins, or moderators can delete this event' });
    }

    await Event.findByIdAndDelete(eventId);

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;