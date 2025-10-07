import express from 'express';
import mongoose from 'mongoose';
import { Event, EventComment, EventVote } from '../models/Event.js';
import { User } from '../models/User.js';
import { authenticateToken } from './auth.js';

const router = express.Router();

// Get all events with vote and comment counts
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const type = req.query.type;
    const status = req.query.status;
    const skip = (page - 1) * limit;

    let query = {};
    if (type) query.type = type;
    if (status) query.status = status;

    const events = await Event.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalEvents = await Event.countDocuments(query);

    // Add vote and comment counts to each event
    const eventsWithCounts = await Promise.all(events.map(async (event) => {
      const [commentCount, upvotes, downvotes] = await Promise.all([
        EventComment.countDocuments({ event_id: event._id }),
        EventVote.countDocuments({ event_id: event._id, vote_type: 'up' }),
        EventVote.countDocuments({ event_id: event._id, vote_type: 'down' })
      ]);

      return {
        ...event,
        comment_count: commentCount,
        upvotes,
        downvotes
      };
    }));

    res.json({
      events: eventsWithCounts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalEvents / limit),
        totalEvents,
        hasNext: page < Math.ceil(totalEvents / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

// Get single event with details
router.get('/:eventId', async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    const event = await Event.findById(eventId).lean();
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get vote and comment counts
    const [commentCount, upvotes, downvotes] = await Promise.all([
      EventComment.countDocuments({ event_id: event._id }),
      EventVote.countDocuments({ event_id: event._id, vote_type: 'up' }),
      EventVote.countDocuments({ event_id: event._id, vote_type: 'down' })
    ]);

    res.json({
      ...event,
      comment_count: commentCount,
      upvotes,
      downvotes
    });

  } catch (error) {
    console.error('Get event error:', error);
    res.status(500).json({ error: 'Failed to fetch event' });
  }
});

// Create new event (protected - admin/moderator only)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { title, description, type, startDate, endDate, prizes, requirements, maxParticipants } = req.body;

    // Check if user is admin or moderator
    const user = await User.findById(userId);
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and moderators can create events' });
    }

    // Validate required fields
    if (!title || !description || !type || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (start >= end) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    const newEvent = new Event({
      title,
      description,
      type,
      startDate: start,
      endDate: end,
      prizes: prizes || [],
      requirements: requirements || [],
      maxParticipants,
      creator: {
        user_id: userId,
        username: user.username,
        avatar: user.avatar,
        verified: user.verified || false
      }
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
    const userId = req.user.userId;
    const { title, description, type, startDate, endDate, prizes, requirements, maxParticipants } = req.body;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if user is admin or moderator
    const user = await User.findById(userId);
    if (!user || !['admin', 'moderator'].includes(user.role)) {
      return res.status(403).json({ error: 'Only admins and moderators can update events' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Update event data
    const updateData = {
      title: title || event.title,
      description: description || event.description,
      type: type || event.type,
      startDate: startDate ? new Date(startDate) : event.startDate,
      endDate: endDate ? new Date(endDate) : event.endDate,
      prizes: prizes !== undefined ? prizes : event.prizes,
      requirements: requirements !== undefined ? requirements : event.requirements,
      maxParticipants: maxParticipants !== undefined ? maxParticipants : event.maxParticipants,
      updatedAt: new Date()
    };

    // Validate dates if provided
    if (updateData.startDate >= updateData.endDate) {
      return res.status(400).json({ error: 'End date must be after start date' });
    }

    await Event.findByIdAndUpdate(eventId, updateData);
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

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Delete related comments and votes
    await Promise.all([
      EventComment.deleteMany({ event_id: eventId }),
      EventVote.deleteMany({ event_id: eventId })
    ]);

    await Event.findByIdAndDelete(eventId);
    res.json({ message: 'Event deleted successfully' });

  } catch (error) {
    console.error('Delete event error:', error);
    res.status(500).json({ error: 'Failed to delete event' });
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

    // Check if event is still active
    if (event.status === 'ended') {
      return res.status(400).json({ error: 'This event has ended' });
    }

    // Check if user already joined
    const alreadyJoined = event.participants.some(p => p.user_id.equals(userId));
    if (alreadyJoined) {
      return res.status(400).json({ error: 'You have already joined this event' });
    }

    // Check if event is full
    if (event.maxParticipants && event.participantCount >= event.maxParticipants) {
      return res.status(400).json({ error: 'This event is full' });
    }

    const user = await User.findById(userId);
    
    // Add user to participants
    event.participants.push({
      user_id: userId,
      username: user.username,
      avatar: user.avatar
    });
    
    event.participantCount = event.participants.length;
    await event.save();

    res.json({
      message: 'Successfully joined event',
      participantCount: event.participantCount
    });

  } catch (error) {
    console.error('Join event error:', error);
    res.status(500).json({ error: 'Failed to join event' });
  }
});

// Get event votes
router.get('/:eventId/votes', authenticateToken, async (req, res) => {
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

    // Get total votes for this event
    const [upvotes, downvotes] = await Promise.all([
      EventVote.countDocuments({ event_id: eventId, vote_type: 'up' }),
      EventVote.countDocuments({ event_id: eventId, vote_type: 'down' })
    ]);

    // Check if current user has voted on this event
    const userVote = await EventVote.findOne({
      event_id: eventId,
      user_id: userId
    });

    res.json({
      upvotes,
      downvotes,
      userVote: userVote ? userVote.vote_type : null
    });

  } catch (error) {
    console.error('Get event votes error:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Vote on event
router.post('/:eventId/vote', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { voteType } = req.body;
    const userId = req.user.userId;

    console.log('Event vote request:', { eventId, voteType, userId });

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!['up', 'down'].includes(voteType)) {
      return res.status(400).json({ error: 'Invalid vote type. Must be "up" or "down"' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Check for existing vote
    const existingVote = await EventVote.findOne({
      event_id: eventId,
      user_id: userId
    });

    let userVote = null;

    if (existingVote) {
      // User has already voted
      if (existingVote.vote_type === voteType) {
        // Same vote type - remove the vote
        await EventVote.deleteOne({ _id: existingVote._id });
        console.log('Vote removed');
      } else {
        // Different vote type - change the vote
        existingVote.vote_type = voteType;
        await existingVote.save();
        userVote = voteType;
        console.log('Vote changed to:', voteType);
      }
    } else {
      // New vote
      const newVote = new EventVote({
        event_id: eventId,
        user_id: userId,
        vote_type: voteType
      });
      
      await newVote.save();
      userVote = voteType;
      console.log('New vote added:', voteType);
    }

    // Get updated vote counts
    const [upvotes, downvotes] = await Promise.all([
      EventVote.countDocuments({ event_id: eventId, vote_type: 'up' }),
      EventVote.countDocuments({ event_id: eventId, vote_type: 'down' })
    ]);

    console.log('Final vote counts:', { upvotes, downvotes, userVote });

    res.json({
      message: 'Vote updated successfully',
      upvotes,
      downvotes,
      userVote
    });

  } catch (error) {
    console.error('Event vote error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({ error: 'You have already voted on this event' });
    }
    
    res.status(500).json({ error: 'Failed to record vote' });
  }
});

// Get event comments
router.get('/:eventId/comments', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Get comments for this event
    const comments = await EventComment.find({ event_id: eventId })
      .populate('user_id', 'username credibility_score')
      .sort({ created_at: -1 })
      .lean();

    const formattedComments = comments.map(comment => ({
      comment_id: comment._id,
      event_id: comment.event_id,
      content: comment.content,
      created_at: comment.created_at,
      username: comment.user_id.username,
      credibility_score: comment.user_id.credibility_score
    }));

    res.json({
      comments: formattedComments
    });

  } catch (error) {
    console.error('Get event comments error:', error);
    res.status(500).json({ error: 'Failed to fetch comments' });
  }
});

// Add event comment
router.post('/:eventId/comments', authenticateToken, async (req, res) => {
  try {
    const { eventId } = req.params;
    const { content } = req.body;
    const userId = req.user.userId;

    console.log('Add comment request:', { eventId, content, userId });

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ error: 'Invalid event ID' });
    }

    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if event exists
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }

    // Create comment
    const comment = new EventComment({
      event_id: eventId,
      user_id: userId,
      content: content.trim()
    });

    await comment.save();
    console.log('Comment saved:', comment._id);

    // Populate user data
    await comment.populate('user_id', 'username credibility_score');

    const responseData = {
      comment_id: comment._id,
      event_id: comment.event_id,
      content: comment.content,
      created_at: comment.created_at,
      username: comment.user_id.username,
      credibility_score: comment.user_id.credibility_score
    };

    console.log('Comment response:', responseData);

    res.status(201).json(responseData);

  } catch (error) {
    console.error('Add event comment error:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
});

export default router;