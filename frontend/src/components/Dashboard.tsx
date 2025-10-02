import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { 
  Heart, 
  MessageSquare, 
  Flag, 
  Star, 
  TrendingUp, 
  Clock, 
  Search,
  Filter,
  Gift,
  Loader2,
  AlertCircle
} from 'lucide-react';

// Type definitions
interface Trade {
  trade_id: string;
  item_offered: string;
  item_requested?: string;
  description?: string;
  status: string;
  created_at: string;
  username: string;
  roblox_username: string;
  credibility_score: number;
  user_id: string;
  images?: Array<{ image_url: string; uploaded_at: string }>;
}

interface ForumPost {
  post_id: string;
  title: string;
  content: string;
  category: string;
  upvotes: number;
  downvotes: number;
  created_at: string;
  username: string;
  credibility_score: number;
  user_id: string;
  images?: Array<{ filename: string; originalName: string; path: string; size: number; mimetype: string }>;
  commentCount: number;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  type: 'giveaway' | 'competition' | 'event';
  status: 'active' | 'ended' | 'upcoming' | 'ending-soon';
  startDate?: string;
  endDate?: string;
  createdAt: string;
  creator?: {
    username: string;
    avatar?: string;
    verified?: boolean;
  };
}

interface DashboardPost {
  id: string;
  type: 'trade' | 'forum' | 'event';
  title: string;
  description: string;
  user: {
    username: string;
    robloxUsername?: string;
    rating: number;
    vouchCount: number;
    verified?: boolean;
    moderator?: boolean;
  };
  timestamp: string;
  comments?: number;
  likes?: number;
  items?: string[];
  wantedItems?: string[];
  offering?: string;
  image?: string;
  category?: string;
  status?: string;
}

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [posts, setPosts] = useState<DashboardPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    activeTraders: 0,
    activeTrades: 0,
    liveEvents: 0
  });
  // Load data from APIs
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError('');

        // Fetch data from all APIs in parallel
        const [tradesData, forumData, eventsData] = await Promise.allSettled([
          apiService.getTrades({ limit: 10, status: 'open' }),
          apiService.getForumPosts({ limit: 10 }),
          apiService.getEvents()
        ]);

        const allPosts: DashboardPost[] = [];
        let activeTradeCount = 0;
        let activeEventCount = 0;

        // Process trades data
        if (tradesData.status === 'fulfilled' && tradesData.value?.trades) {
          const trades: Trade[] = tradesData.value.trades;
          activeTradeCount = trades.filter(trade => trade.status === 'open').length;
          
          trades.forEach(trade => {
            // Safely create timestamp
            let timestamp = 'Recently';
            try {
              if (trade.created_at) {
                timestamp = new Date(trade.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch {
              console.warn('Invalid date format for trade:', trade.trade_id);
            }

            allPosts.push({
              id: trade.trade_id,
              type: 'trade',
              title: `Trading ${trade.item_offered}${trade.item_requested ? ` for ${trade.item_requested}` : ''}`,
              description: trade.description || `Looking to trade ${trade.item_offered}${trade.item_requested ? ` for ${trade.item_requested}` : '. Contact me for offers!'}`,
              user: {
                username: trade.username || 'Unknown User',
                robloxUsername: trade.roblox_username,
                rating: Math.min(5, Math.max(1, Math.floor((trade.credibility_score || 0) / 20))),
                vouchCount: Math.floor((trade.credibility_score || 0) / 2)
              },
              timestamp,
              items: [trade.item_offered],
              wantedItems: trade.item_requested ? [trade.item_requested] : undefined,
              status: trade.status,
              image: trade.images && trade.images.length > 0 ? `http://localhost:5000${trade.images[0].image_url}` : undefined,
              comments: Math.floor(Math.random() * 20),
              likes: Math.floor(Math.random() * 50)
            });
          });
        }

        // Process forum posts data
        if (forumData.status === 'fulfilled' && Array.isArray(forumData.value)) {
          const forumPosts: ForumPost[] = forumData.value;
          
          forumPosts.forEach(post => {
            // Safely create timestamp
            let timestamp = 'Recently';
            try {
              if (post.created_at) {
                timestamp = new Date(post.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch {
              console.warn('Invalid date format for forum post:', post.post_id);
            }

            allPosts.push({
              id: post.post_id,
              type: 'forum',
              title: post.title,
              description: post.content && post.content.length > 200 ? post.content.substring(0, 200) + '...' : (post.content || 'No content available'),
              user: {
                username: post.username || 'Unknown User',
                rating: Math.min(5, Math.max(1, Math.floor((post.credibility_score || 0) / 20))),
                vouchCount: Math.floor((post.credibility_score || 0) / 2)
              },
              timestamp,
              comments: post.commentCount || 0,
              likes: post.upvotes || 0,
              category: post.category,
              image: post.images && post.images.length > 0 ? `http://localhost:5000/uploads/forum/${post.images[0].filename}` : undefined
            });
          });
        }

        // Process events data
        if (eventsData.status === 'fulfilled' && Array.isArray(eventsData.value)) {
          const events: Event[] = eventsData.value;
          activeEventCount = events.filter(event => 
            event.status === 'active' || event.status === 'upcoming'
          ).length;
          
          events.forEach(event => {
            // Safely create timestamp
            let timestamp = 'Recently';
            try {
              if (event.createdAt) {
                timestamp = new Date(event.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                });
              }
            } catch {
              console.warn('Invalid date format for event:', event._id);
            }

            allPosts.push({
              id: event._id,
              type: 'event',
              title: event.title,
              description: event.description || 'Check out this community event!',
              user: {
                username: event.creator?.username || 'Event Host',
                rating: 5,
                vouchCount: 999,
                verified: event.creator?.verified || true,
                moderator: true
              },
              timestamp,
              comments: Math.floor(Math.random() * 100),
              likes: Math.floor(Math.random() * 200)
            });
          });
        }

        // Sort posts by timestamp (newest first) with better error handling
        allPosts.sort((a, b) => {
          try {
            // Try to parse as dates first
            const dateA = new Date(a.timestamp);
            const dateB = new Date(b.timestamp);
            
            // If both are valid dates, sort by them
            if (!isNaN(dateA.getTime()) && !isNaN(dateB.getTime())) {
              return dateB.getTime() - dateA.getTime();
            }
            
            // Fallback to string comparison
            return a.timestamp.localeCompare(b.timestamp);
          } catch {
            // If all else fails, maintain current order
            return 0;
          }
        });
        
        // Calculate real active traders from trades data
        let activeTraderCount = 0;
        if (tradesData.status === 'fulfilled' && tradesData.value?.trades) {
          const uniqueTraders = new Set();
          tradesData.value.trades.forEach((trade: Trade) => {
            if (trade.status === 'open') {
              uniqueTraders.add(trade.user_id);
            }
          });
          activeTraderCount = uniqueTraders.size;
        }
        
        setPosts(allPosts);
        setStats({
          activeTraders: activeTraderCount,
          activeTrades: activeTradeCount,
          liveEvents: activeEventCount
        });

      } catch (err) {
        console.error('Error loading dashboard data:', err);
        setError('Failed to load dashboard data. Please try again.');
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4" />;
      case 'event': return <Gift className="w-4 h-4" />;
      case 'forum': return <MessageSquare className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'bg-blue-500';
      case 'event': return 'bg-green-500';
      case 'forum': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || post.type === filterType;
    return matchesSearch && matchesFilter;
  });

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && posts.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Home Feed</h1>
            <p className="text-muted-foreground">Latest trades, giveaways, and community updates</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="trade">Trades</SelectItem>
                <SelectItem value="forum">Forum</SelectItem>
                <SelectItem value="event">Events</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="bg-muted/30 border-b border-border p-4">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span>{stats.activeTraders.toLocaleString()} Active Traders</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>{stats.activeTrades} Active Trades</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-500" />
            <span>{stats.liveEvents} Live Events</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                        {post.user.username[0]?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{post.user.username}</span>
                        {post.user.verified && (
                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            ✓ Verified
                          </Badge>
                        )}
                        {post.user.moderator && (
                          <Badge variant="secondary" className="text-xs bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300">
                            MOD
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>@{post.user.robloxUsername || post.user.username}</span>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < post.user.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span>({post.user.vouchCount})</span>
                        </div>
                        <span>•</span>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>{post.timestamp}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={`${getPostTypeColor(post.type)} text-white`}>
                      {getPostTypeIcon(post.type)}
                      <span className="ml-1 capitalize">{post.type}</span>
                    </Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2">{post.title}</h3>
                  <p className="text-muted-foreground">{post.description}</p>
                </div>

                {post.image && (
                  <div className="rounded-lg overflow-hidden">
                    <img 
                      src={post.image} 
                      alt="Trade item"
                      className="w-full h-48 object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}

                {/* Trade Details */}
                {post.type === 'trade' && (
                  <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Offering:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.items?.map((item, i) => (
                          <Badge key={i} variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {post.wantedItems && (
                      <div>
                        <span className="text-sm text-muted-foreground">Looking for:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {post.wantedItems?.map((item, i) => (
                            <Badge key={i} variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {post.status && (
                      <div>
                        <span className="text-sm text-muted-foreground">Status:</span>
                        <Badge variant="outline" className={`ml-1 ${
                          post.status === 'open' ? 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' :
                          post.status === 'completed' ? 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' :
                          'bg-gray-50 text-gray-700 dark:bg-gray-950 dark:text-gray-300'
                        }`}>
                          {post.status}
                        </Badge>
                      </div>
                    )}
                  </div>
                )}

                {/* Forum Details */}
                {post.type === 'forum' && post.category && (
                  <div className="p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                        {post.category.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-blue-500 hover:bg-blue-600 text-white">
                      Message
                    </Button>
                    <Button variant="outline" size="sm">
                      <Star className="w-4 h-4 mr-1" />
                      Vouch
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-destructive">
                      <Flag className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredPosts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p>Try adjusting your search or filter criteria.</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}