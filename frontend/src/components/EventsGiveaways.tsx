import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Progress } from './ui/progress';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { apiService } from '../services/api';
import { useAuth } from '../App';
import { toast } from 'sonner';
import { 
  Gift, 
  Calendar, 
  Search, 
  Clock,
  Trophy,
  Heart,
  MessageSquare,
  Loader2,
  Plus,
  Shield,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  Send,
  Eye,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Event {
  _id: string;
  title: string;
  description: string;
  type: 'giveaway' | 'competition' | 'event';
  status: 'active' | 'ended' | 'upcoming' | 'ending-soon';
  prizes?: string[];
  requirements?: string[];
  maxParticipants?: number;
  participantCount?: number;
  startDate: string;
  endDate: string;
  creator?: {
    username: string;
    avatar?: string;
    verified?: boolean;
  };
  participants?: Array<{
    _id: string;
    username: string;
    avatar?: string;
  }>;
  createdAt: string;
  // Add voting and comment fields
  upvotes?: number;
  downvotes?: number;
  comment_count?: number;
  comments?: EventComment[];
}

interface EventComment {
  comment_id: string;
  event_id: string;
  user_id: string;
  content: string;
  created_at: string;
  username: string;
  credibility_score?: number;
}

// Event Details Modal Component
interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
  deleteLoading: boolean;
  onJoin: (eventId: string, eventType: string) => void;
  joinLoading: string | null;
}

function EventDetailsModal({ 
  event, 
  isOpen, 
  onClose, 
  onEdit, 
  onDelete, 
  canEdit, 
  canDelete, 
  deleteLoading,
  onJoin,
  joinLoading
}: EventDetailsModalProps) {
  const [comments, setComments] = useState<EventComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [loadingComments, setLoadingComments] = useState(false);
  const [upvotes, setUpvotes] = useState(0);
  const [downvotes, setDownvotes] = useState(0);
  const [userVote, setUserVote] = useState<'up' | 'down' | null>(null);
  const [votingLoading, setVotingLoading] = useState(false);

  // Load event comments and votes when modal opens
  useEffect(() => {
    if (isOpen && event) {
      loadEventData();
    }
  }, [isOpen, event]);

  const loadEventData = async () => {
    if (!event) return;

    try {
      setLoadingComments(true);
      console.log('Loading event data for:', event._id);
      
      // Load comments and vote data
      const [commentsResponse, voteResponse] = await Promise.allSettled([
        apiService.getEventComments(event._id),
        apiService.getEventVotes(event._id)
      ]);

      // Handle comments
      if (commentsResponse.status === 'fulfilled') {
        setComments(commentsResponse.value.comments || []);
      } else {
        console.error('Failed to load comments:', commentsResponse.reason);
        setComments([]);
      }

      // Handle votes
      if (voteResponse.status === 'fulfilled') {
        setUpvotes(voteResponse.value.upvotes || 0);
        setDownvotes(voteResponse.value.downvotes || 0);
        setUserVote(voteResponse.value.userVote || null);
      } else {
        console.error('Failed to load votes:', voteResponse.reason);
        setUpvotes(event.upvotes || 0);
        setDownvotes(event.downvotes || 0);
        setUserVote(null);
      }

    } catch (error) {
      console.error('Failed to load event data:', error);
      toast.error('Failed to load event data');
    } finally {
      setLoadingComments(false);
    }
  };

  const handleUpvote = async () => {
    if (!event || votingLoading) return;

    try {
      setVotingLoading(true);
      console.log('Upvoting event:', event._id);
      
      const response = await apiService.voteEvent(event._id, 'up');
      
      setUpvotes(response.upvotes);
      setDownvotes(response.downvotes);
      setUserVote(response.userVote);
      
      if (response.userVote === 'up') {
        toast.success('Upvoted!');
      } else if (response.userVote === null) {
        toast.success('Vote removed!');
      } else {
        toast.success('Changed to upvote!');
      }
    } catch (error) {
      console.error('Failed to upvote:', error);
      toast.error('Failed to update vote');
    } finally {
      setVotingLoading(false);
    }
  };

  const handleDownvote = async () => {
    if (!event || votingLoading) return;

    try {
      setVotingLoading(true);
      console.log('Downvoting event:', event._id);
      
      const response = await apiService.voteEvent(event._id, 'down');
      
      setUpvotes(response.upvotes);
      setDownvotes(response.downvotes);
      setUserVote(response.userVote);
      
      if (response.userVote === 'down') {
        toast.success('Downvoted!');
      } else if (response.userVote === null) {
        toast.success('Vote removed!');
      } else {
        toast.success('Changed to downvote!');
      }
    } catch (error) {
      console.error('Failed to downvote:', error);
      toast.error('Failed to update vote');
    } finally {
      setVotingLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !event || submittingComment) return;

    try {
      setSubmittingComment(true);
      console.log('Adding comment to event:', event._id);
      
      const comment = await apiService.addEventComment(event._id, newComment);
      
      setComments(prev => [comment, ...prev]);
      setNewComment('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Failed to add comment:', error);
      toast.error('Failed to add comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  if (!event) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'ending-soon': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'ended': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'giveaway': return <Gift className="w-5 h-5" />;
      case 'competition': return <Trophy className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>Event Details</span>
            <Badge className={getStatusColor(event.status)}>
              {event.status}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Event Info */}
          <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
            <Avatar className="w-12 h-12">
              <AvatarImage src={event.creator?.avatar || `/api/placeholder/40/40`} />
              <AvatarFallback>{event.creator?.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{event.creator?.username || 'Unknown'}</span>
                {event.creator?.verified && (
                  <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    ✓
                  </Badge>
                )}
              </div>
              <div className="text-sm text-muted-foreground">
                Event Host
              </div>
            </div>
            
            {/* Vote Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUpvote}
                disabled={votingLoading}
                className={`${userVote === 'up' ? 'text-green-600 bg-green-50 dark:bg-green-950' : 'text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950'} transition-colors`}
              >
                <ArrowUp className={`w-5 h-5 mr-2 ${userVote === 'up' ? 'fill-current' : ''}`} />
                {upvotes}
                {votingLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDownvote}
                disabled={votingLoading}
                className={`${userVote === 'down' ? 'text-red-600 bg-red-50 dark:bg-red-950' : 'text-muted-foreground hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950'} transition-colors`}
              >
                <ArrowDown className={`w-5 h-5 mr-2 ${userVote === 'down' ? 'fill-current' : ''}`} />
                {downvotes}
                {votingLoading && <Loader2 className="w-3 h-3 animate-spin ml-1" />}
              </Button>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {getTypeIcon(event.type)}
                <span className="ml-1">{event.type}</span>
              </Badge>
              <Badge className={getStatusColor(event.status)}>
                {event.status}
              </Badge>
            </div>

            <div>
              <h3 className="font-semibold text-xl mb-3">{event.title}</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{event.description}</p>
            </div>

            {/* Prizes */}
            {event.prizes && event.prizes.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-green-700 dark:text-green-300 mb-2">Prizes</h4>
                <div className="flex flex-wrap gap-2">
                  {event.prizes.map((prize, i) => (
                    <Badge key={i} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                      {prize}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Requirements */}
            {event.requirements && event.requirements.length > 0 && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {event.requirements.map((req, i) => (
                    <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Progress */}
            {event.maxParticipants && (
              <div className="p-4 border rounded-lg">
                <h4 className="font-semibold mb-2">Participation</h4>
                <div className="flex justify-between text-sm mb-2">
                  <span>{event.participantCount || 0} participants</span>
                  <span>{event.maxParticipants} max</span>
                </div>
                <Progress value={((event.participantCount || 0) / event.maxParticipants) * 100} className="h-2" />
              </div>
            )}
          </div>

          {/* Vote Stats */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-600">
                <ArrowUp className="w-4 h-4" />
                <span className="font-medium">{upvotes}</span>
              </div>
              <span className="text-muted-foreground">Upvotes</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-red-600">
                <ArrowDown className="w-4 h-4" />
                <span className="font-medium">{downvotes}</span>
              </div>
              <span className="text-muted-foreground">Downvotes</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-600">
                <MessageSquare className="w-4 h-4" />
                <span className="font-medium">{comments.length}</span>
              </div>
              <span className="text-muted-foreground">Comments</span>
            </div>
          </div>

          {/* Comments Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">
                Comments ({comments.length})
                {loadingComments && <Loader2 className="w-4 h-4 animate-spin inline ml-2" />}
              </h3>
            </div>

            {/* Add Comment */}
            <div className="flex gap-3 p-4 border rounded-lg bg-muted/20">
              <Avatar className="w-8 h-8">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-sm">
                  Y
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 flex gap-2">
                <Input
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleAddComment()}
                  disabled={submittingComment}
                  className="flex-1"
                />
                <Button
                  size="sm"
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || submittingComment}
                >
                  {submittingComment ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4 max-h-60 overflow-y-auto">
              {loadingComments ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => (
                  <div key={comment.comment_id} className="flex gap-3 p-3 border rounded-lg">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-sm">
                        {comment.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{comment.username}</span>
                        {comment.credibility_score && (
                          <Badge variant="secondary" className="text-xs">
                            {comment.credibility_score}★
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          {new Date(comment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{comment.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <MessageSquare className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No comments yet. Be the first to comment!</p>
                </div>
              )}
            </div>
          </div>

          {/* Event Info */}
          <div className="grid grid-cols-2 gap-4 p-4 bg-muted/50 rounded-lg text-sm">
            <div>
              <span className="text-muted-foreground">Start Date:</span>
              <div className="font-medium">{new Date(event.startDate).toLocaleDateString()}</div>
            </div>
            <div>
              <span className="text-muted-foreground">End Date:</span>
              <div className="font-medium">{new Date(event.endDate).toLocaleDateString()}</div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t">
            <Button 
              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
              onClick={() => onJoin(event._id, event.type)}
              disabled={joinLoading === event._id || event.status === 'ended'}
            >
              {joinLoading === event._id ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Joining...
                </>
              ) : (
                <>
                  {getTypeIcon(event.type)}
                  <span className="ml-2">
                    {event.type === 'giveaway' ? 'Enter Giveaway' : 
                     event.type === 'competition' ? 'Join Competition' : 'RSVP'}
                  </span>
                </>
              )}
            </Button>
            
            {canEdit && (
              <Button variant="outline" onClick={onEdit}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
            
            {canDelete && (
              <Button 
                variant="outline" 
                onClick={onDelete}
                disabled={deleteLoading}
                className="text-red-600 hover:text-red-700"
              >
                {deleteLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                {deleteLoading ? 'Deleting...' : 'Delete'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function EventsGiveaways() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState<string | null>(null);
  
  // Modal states
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  
  // Check if user is admin or moderator
  const isAdminOrModerator = user?.role === 'admin' || user?.role === 'moderator';
  
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    type: 'event',
    startDate: '',
    endDate: '',
    prizes: [] as string[],
    requirements: [] as string[],
    maxParticipants: undefined as number | undefined
  });

  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

  // Load events from API
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await apiService.getEvents();
      
      // Fix: Extract events array from response object
      const eventsArray = response.events || response || [];
      
      // Add vote and comment counts to each event
      const eventsWithCounts = await Promise.all(eventsArray.map(async (event: Event) => {
        try {
          const [voteResponse, commentResponse] = await Promise.allSettled([
            apiService.getEventVotes(event._id),
            apiService.getEventComments(event._id)
          ]);

          let upvotes = 0, downvotes = 0, comment_count = 0;

          if (voteResponse.status === 'fulfilled') {
            upvotes = voteResponse.value.upvotes || 0;
            downvotes = voteResponse.value.downvotes || 0;
          }

          if (commentResponse.status === 'fulfilled') {
            comment_count = commentResponse.value.comments?.length || 0;
          }

          return {
            ...event,
            upvotes,
            downvotes,
            comment_count
          };
        } catch (error) {
          console.error('Failed to load counts for event:', event._id, error);
          return {
            ...event,
            upvotes: 0,
            downvotes: 0,
            comment_count: 0
          };
        }
      }));

      setEvents(eventsWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load events');
      console.error('Load events error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setIsDetailsModalOpen(true);
  };

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false);
    setSelectedEvent(null);
  };

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreateLoading(true);
      setError('');
      
      await apiService.createEvent({
        title: newEvent.title,
        description: newEvent.description,
        type: newEvent.type as 'giveaway' | 'competition' | 'event',
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        prizes: newEvent.prizes.filter(p => p.trim()),
        requirements: newEvent.requirements.filter(r => r.trim()),
        maxParticipants: newEvent.maxParticipants
      });
      
      setIsCreateDialogOpen(false);
      setNewEvent({
        title: '',
        description: '',
        type: 'event',
        startDate: '',
        endDate: '',
        prizes: [],
        requirements: [],
        maxParticipants: undefined
      });
      
      // Reload events to show the new one
      await loadEvents();
      toast.success('Event created successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create event');
      toast.error('Failed to create event');
    } finally {
      setCreateLoading(false);
    }
  };

  const handleJoinEvent = async (eventId: string, eventType: string) => {
    try {
      setJoinLoading(eventId);
      setError('');
      
      await apiService.joinEvent(eventId);
      
      // Reload events to update participant count
      await loadEvents();
      toast.success(`Successfully joined ${eventType}!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to join ${eventType}`);
      toast.error(`Failed to join ${eventType}`);
    } finally {
      setJoinLoading(null);
    }
  };

  const handleDeleteEvent = async (eventId: string, eventTitle: string) => {
    if (!confirm(`Are you sure you want to delete the event "${eventTitle}"? This action cannot be undone.`)) {
      return;
    }

    try {
      setDeleteLoading(eventId);
      setError('');
      
      await apiService.deleteEvent(eventId);
      
      // Reload events to remove the deleted event
      await loadEvents();
      toast.success('Event deleted successfully!');
      
      // Close modal if it's the deleted event
      if (selectedEvent?._id === eventId) {
        handleCloseDetailsModal();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete event');
      toast.error('Failed to delete event');
    } finally {
      setDeleteLoading(null);
    }
  };

  const handleEditEvent = (event: Event) => {
    setEditingEvent(event);
    setNewEvent({
      title: event.title,
      description: event.description,
      type: event.type,
      startDate: event.startDate ? new Date(event.startDate).toISOString().slice(0, 16) : '',
      endDate: event.endDate ? new Date(event.endDate).toISOString().slice(0, 16) : '',
      prizes: event.prizes || [],
      requirements: event.requirements || [],
      maxParticipants: event.maxParticipants
    });
    setIsEditDialogOpen(true);
    // Close details modal
    setIsDetailsModalOpen(false);
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      setCreateLoading(true);
      setError('');
      
      await apiService.updateEvent(editingEvent._id, {
        title: newEvent.title,
        description: newEvent.description,
        type: newEvent.type as 'giveaway' | 'competition' | 'event',
        startDate: newEvent.startDate,
        endDate: newEvent.endDate,
        prizes: newEvent.prizes.filter(p => p.trim()),
        requirements: newEvent.requirements.filter(r => r.trim()),
        maxParticipants: newEvent.maxParticipants
      });
      
      setIsEditDialogOpen(false);
      setEditingEvent(null);
      setNewEvent({
        title: '',
        description: '',
        type: 'event',
        startDate: '',
        endDate: '',
        prizes: [],
        requirements: [],
        maxParticipants: undefined
      });
      
      // Reload events to show the updated one
      await loadEvents();
      toast.success('Event updated successfully!');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update event');
      toast.error('Failed to update event');
    } finally {
      setCreateLoading(false);
    }
  };

  // Helper functions for UI

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'ending-soon': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'ended': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Active';
      case 'ending-soon': return 'Ending Soon';
      case 'upcoming': return 'Upcoming';
      case 'ended': return 'Ended';
      default: return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'giveaway': return <Gift className="w-5 h-5" />;
      case 'competition': return <Trophy className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const filteredEvents = events.filter((event) => {
    const matchesSearch = searchTerm === '' || 
      event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || event.type === filterType;
    
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-7 h-7 text-purple-500" />
              Events & Giveaways
            </h1>
            <p className="text-muted-foreground">Join exciting events and enter amazing giveaways</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Event Calendar
            </Button>
            {isAdminOrModerator && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Event
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Create New Event</DialogTitle>
                  <DialogDescription>
                    Create a new event or giveaway for the community
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateEvent} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="event-title">Title *</Label>
                    <Input
                      id="event-title"
                      placeholder="Enter event title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-type">Type</Label>
                    <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="event">Community Event</SelectItem>
                        <SelectItem value="giveaway">Giveaway</SelectItem>
                        <SelectItem value="competition">Competition</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="event-description">Description</Label>
                    <Textarea
                      id="event-description"
                      placeholder="Describe your event..."
                      value={newEvent.description}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                      className="min-h-[100px]"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="start-date">Start Date</Label>
                      <Input
                        id="start-date"
                        type="datetime-local"
                        value={newEvent.startDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="end-date">End Date</Label>
                      <Input
                        id="end-date"
                        type="datetime-local"
                        value={newEvent.endDate}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="max-participants">Max Participants (optional)</Label>
                    <Input
                      id="max-participants"
                      type="number"
                      placeholder="No limit"
                      value={newEvent.maxParticipants || ''}
                      onChange={(e) => setNewEvent(prev => ({ 
                        ...prev, 
                        maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                      }))}
                      min="1"
                    />
                  </div>
                  
                  {(newEvent.type === 'giveaway' || newEvent.type === 'competition') && (
                    <div className="space-y-2">
                      <Label htmlFor="prizes">Prizes (comma-separated)</Label>
                      <Input
                        id="prizes"
                        placeholder="e.g., 1000 Robux, Limited Item, etc."
                        value={newEvent.prizes.join(', ')}
                        onChange={(e) => setNewEvent(prev => ({ 
                          ...prev, 
                          prizes: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                        }))}
                      />
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="requirements">Requirements (comma-separated, optional)</Label>
                    <Input
                      id="requirements"
                      placeholder="e.g., Follow on Twitter, Join Discord, etc."
                      value={newEvent.requirements.join(', ')}
                      onChange={(e) => setNewEvent(prev => ({ 
                        ...prev, 
                        requirements: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                      }))}
                    />
                  </div>
                  
                  {error && (
                    <div className="text-red-500 text-sm">{error}</div>
                  )}
                  
                  <div className="flex justify-end gap-3 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={createLoading}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white" disabled={createLoading}>
                      {createLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        'Create Event'
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
              </Dialog>
            )}

            {/* Edit Event Dialog */}
            {editingEvent && (
              <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Edit Event</DialogTitle>
                    <DialogDescription>
                      Update the event details
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={handleUpdateEvent} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="edit-event-title">Title *</Label>
                      <Input
                        id="edit-event-title"
                        placeholder="Enter event title"
                        value={newEvent.title}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-event-type">Type</Label>
                      <Select value={newEvent.type} onValueChange={(value) => setNewEvent(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="event">Community Event</SelectItem>
                          <SelectItem value="giveaway">Giveaway</SelectItem>
                          <SelectItem value="competition">Competition</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-event-description">Description</Label>
                      <Textarea
                        id="edit-event-description"
                        placeholder="Describe your event..."
                        value={newEvent.description}
                        onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                        className="min-h-[100px]"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="edit-start-date">Start Date</Label>
                        <Input
                          id="edit-start-date"
                          type="datetime-local"
                          value={newEvent.startDate}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, startDate: e.target.value }))}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="edit-end-date">End Date</Label>
                        <Input
                          id="edit-end-date"
                          type="datetime-local"
                          value={newEvent.endDate}
                          onChange={(e) => setNewEvent(prev => ({ ...prev, endDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-max-participants">Max Participants (optional)</Label>
                      <Input
                        id="edit-max-participants"
                        type="number"
                        placeholder="No limit"
                        value={newEvent.maxParticipants || ''}
                        onChange={(e) => setNewEvent(prev => ({ 
                          ...prev, 
                          maxParticipants: e.target.value ? parseInt(e.target.value) : undefined 
                        }))}
                        min="1"
                      />
                    </div>
                    
                    {(newEvent.type === 'giveaway' || newEvent.type === 'competition') && (
                      <div className="space-y-2">
                        <Label htmlFor="edit-prizes">Prizes (comma-separated)</Label>
                        <Input
                          id="edit-prizes"
                          placeholder="e.g., 1000 Robux, Limited Item, etc."
                          value={newEvent.prizes.join(', ')}
                          onChange={(e) => setNewEvent(prev => ({ 
                            ...prev, 
                            prizes: e.target.value.split(',').map(p => p.trim()).filter(p => p) 
                          }))}
                        />
                      </div>
                    )}
                    
                    <div className="space-y-2">
                      <Label htmlFor="edit-requirements">Requirements (comma-separated, optional)</Label>
                      <Input
                        id="edit-requirements"
                        placeholder="e.g., Follow on Twitter, Join Discord, etc."
                        value={newEvent.requirements.join(', ')}
                        onChange={(e) => setNewEvent(prev => ({ 
                          ...prev, 
                          requirements: e.target.value.split(',').map(r => r.trim()).filter(r => r) 
                        }))}
                      />
                    </div>
                    
                    {error && (
                      <div className="text-red-500 text-sm">{error}</div>
                    )}
                    
                    <div className="flex justify-end gap-3 pt-4">
                      <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={createLoading}>
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white" disabled={createLoading}>
                        {createLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Update Event'
                        )}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events and giveaways..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="giveaway">Giveaways</SelectItem>
              <SelectItem value="competition">Competitions</SelectItem>
              <SelectItem value="event">Community Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-background p-4 border-b border-border">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-500" />
            <span>{filteredEvents.length} Events Found</span>
          </div>
          {!isAdminOrModerator && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Shield className="w-4 h-4 text-blue-500" />
              <span>Event creation restricted to staff members</span>
            </div>
          )}
          {loading && (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
              <span>Loading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-all duration-200 cursor-pointer" onClick={() => handleEventClick(event)}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={event.creator?.avatar || `/api/placeholder/40/40`} />
                        <AvatarFallback>{event.creator?.username?.[0] || 'U'}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{event.creator?.username || 'Unknown'}</span>
                          {event.creator?.verified && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              ✓
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(event.status)}>
                        {getStatusText(event.status)}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {getTypeIcon(event.type)}
                        <span className="ml-1">{event.type}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>

                  {/* Prizes */}
                  {event.prizes && (
                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">Prizes:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.prizes.slice(0, 3).map((prize, i) => (
                          <Badge key={i} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {prize}
                          </Badge>
                        ))}
                        {event.prizes.length > 3 && (
                          <Badge variant="outline">+{event.prizes.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {event.maxParticipants && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Participants: {event.participantCount || 0}</span>
                        <span>{event.maxParticipants} max</span>
                      </div>
                      <Progress value={((event.participantCount || 0) / event.maxParticipants) * 100} className="h-2" />
                    </div>
                  )}

                  {/* Requirements */}
                  {event.requirements && event.requirements.length > 0 && (
                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">Requirements:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.requirements.map((req, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Time and Stats */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>Ends: {new Date(event.endDate).toLocaleDateString()}</span>
                      </div>
                      {event.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4 text-green-500" />
                          <span>Started: {new Date(event.startDate).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Updated Stats with upvotes/downvotes */}
                  <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-green-600">
                        <ArrowUp className="w-3 h-3" />
                        <span>{event.upvotes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1 text-red-600">
                        <ArrowDown className="w-3 h-3" />
                        <span>{event.downvotes || 0}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{event.comment_count || 0}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      <span>View Details</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleJoinEvent(event._id, event.type);
                      }}
                      disabled={joinLoading === event._id || event.status === 'ended'}
                    >
                      {joinLoading === event._id ? (
                        <>
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                          Joining...
                        </>
                      ) : (
                        event.type === 'giveaway' ? 'Enter Giveaway' : 
                        event.type === 'competition' ? 'Join Competition' : 'RSVP'
                      )}
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Heart className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                    
                    {/* Admin/Moderator actions */}
                    {isAdminOrModerator && (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-blue-600 hover:text-blue-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditEvent(event);
                          }}
                        >
                          <Edit className="w-3 h-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteEvent(event._id, event.title);
                          }}
                          disabled={deleteLoading === event._id}
                        >
                          {deleteLoading === event._id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Event Details Modal */}
      <EventDetailsModal
        event={selectedEvent}
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        onEdit={() => handleEditEvent(selectedEvent!)}
        onDelete={() => handleDeleteEvent(selectedEvent!._id, selectedEvent!.title)}
        canEdit={isAdminOrModerator}
        canDelete={isAdminOrModerator}
        deleteLoading={deleteLoading === selectedEvent?._id}
        onJoin={handleJoinEvent}
        joinLoading={joinLoading}
      />
    </div>
  );
}