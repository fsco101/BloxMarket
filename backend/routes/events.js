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
      .populate('created_by', 'username')
      .sort({ start_date: -1 });

    res.json(events.map(event => ({
      event_id: event._id,
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      created_at: event.createdAt,
      created_by_username: event.created_by.username
    })));

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
      .populate('created_by', 'username');

    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({
      event_id: event._id,
      title: event.title,
      description: event.description,
      start_date: event.start_date,
      end_date: event.end_date,
      created_at: event.createdAt,
      created_by_username: event.created_by.username,
      created_by_id: event.created_by._id
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to get event' });
  }
});

// Create event (protected - admin/moderator only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.userId;

    // Check if user is admin or moderator
    const user = await User.findById(userId);
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and moderators can create events' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newEvent = new Event({
      title,
      description: description || undefined,
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

// Update event (protected - admin/moderator only)
router.put('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if user is admin or moderator
    const user = await User.findById(userId);
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and moderators can update events' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    await Event.findByIdAndUpdate(eventId, {
      title,
      description,
      start_date: startDate ? new Date(startDate) : undefined,
      end_date: endDate ? new Date(endDate) : undefined
    });

    res.json({ message: 'Event updated successfully' });

  } catch (error) {
    console.error('Update event error:', error);
    res.status(500).json({ error: 'Failed to update event' });
  }
});

// Delete event (protected - admin/moderator only)
router.delete('/:eventId', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const userId = req.user.userId;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if user is admin or moderator
    const user = await User.findById(userId);
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and moderators can delete events' });
    }

    const deletedEvent = await Event.findByIdAndDelete(eventId);
    if (!deletedEvent) {
      return res.status(404).json({ error: 'Event not found' });
    }

    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
  }
});

export default router;