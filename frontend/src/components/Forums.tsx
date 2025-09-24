import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  MessageSquare, 
  Search, 
  Plus,
  ArrowUp,
  ArrowDown,
  Clock,
  Eye,
  Pin,
  Lock,
  TrendingUp,
  Users,
  MessageCircle
} from 'lucide-react';

export function Forums() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('activity');

  // Mock forum data
  const forumPosts = [
    {
      id: 1,
      title: 'Best Trading Strategies for New Players - Updated Guide 2024',
      content: 'After trading for 3+ years, here are my top tips for new traders looking to get started safely...',
      author: {
        username: 'TradingExpert',
        robloxUsername: 'TradingExpert',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 234,
        role: 'expert'
      },
      category: 'guides',
      timestamp: '2 hours ago',
      lastActivity: '15 min ago',
      upvotes: 45,
      downvotes: 2,
      replies: 23,
      views: 342,
      pinned: true,
      tags: ['guide', 'trading', 'beginners']
    },
    {
      id: 2,
      title: 'SCAM ALERT: New Fake Middleman Service Going Around',
      content: 'WARNING: There\'s a new scam where fake middlemen are impersonating verified users. Here\'s how to spot them...',
      author: {
        username: 'SafetyFirst',
        robloxUsername: 'SafetyFirst',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 89,
        role: 'moderator'
      },
      category: 'safety',
      timestamp: '4 hours ago',
      lastActivity: '1 hour ago',
      upvotes: 67,
      downvotes: 0,
      replies: 15,
      views: 578,
      pinned: true,
      urgent: true,
      tags: ['scam-alert', 'safety', 'middleman']
    },
    {
      id: 3,
      title: 'Market Analysis: Dominus Prices Trending Up This Week',
      content: 'I\'ve been tracking dominus prices across different platforms and noticed some interesting trends...',
      author: {
        username: 'MarketAnalyst',
        robloxUsername: 'MarketAnalyst',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 156
      },
      category: 'market-discussion',
      timestamp: '1 day ago',
      lastActivity: '3 hours ago',
      upvotes: 23,
      downvotes: 1,
      replies: 8,
      views: 234,
      tags: ['market-analysis', 'dominus', 'prices']
    },
    {
      id: 4,
      title: 'Looking for Trading Partners - Active Daily Trader',
      content: 'Hey everyone! I\'m looking for reliable trading partners who are active daily. I specialize in...',
      author: {
        username: 'ActiveTrader99',
        robloxUsername: 'ActiveTrader99',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 3,
        vouchCount: 45
      },
      category: 'trading-partners',
      timestamp: '2 days ago',
      lastActivity: '6 hours ago',
      upvotes: 12,
      downvotes: 0,
      replies: 34,
      views: 167,
      tags: ['trading-partners', 'daily-trader']
    },
    {
      id: 5,
      title: 'Community Event: Weekly Trading Competition Results!',
      content: 'Congratulations to this week\'s winners of our trading competition! Here are the results and next week\'s theme...',
      author: {
        username: 'EventManager',
        robloxUsername: 'EventManager',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 0,
        role: 'staff'
      },
      category: 'events',
      timestamp: '3 days ago',
      lastActivity: '1 day ago',
      upvotes: 89,
      downvotes: 3,
      replies: 56,
      views: 445,
      tags: ['events', 'competition', 'community']
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'guides', label: 'Guides & Tutorials' },
    { value: 'market-discussion', label: 'Market Discussion' },
    { value: 'trading-partners', label: 'Trading Partners' },
    { value: 'safety', label: 'Safety & Scams' },
    { value: 'events', label: 'Events & Competitions' },
    { value: 'general', label: 'General Discussion' }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'staff': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'moderator': return 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300';
      case 'expert': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredPosts = forumPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = filterCategory === 'all' || post.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const sortedPosts = filteredPosts.sort((a, b) => {
    // Pinned posts always come first
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    
    switch (sortBy) {
      case 'activity':
        return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime();
      case 'newest':
        return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
      case 'popular':
        return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
      case 'replies':
        return b.replies - a.replies;
      default:
        return 0;
    }
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="w-7 h-7 text-blue-500" />
              Community Forums
            </h1>
            <p className="text-muted-foreground">Discuss trading, share tips, and connect with the community</p>
          </div>
          
          <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Post
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search posts, tags, or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activity">Latest Activity</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="replies">Most Replies</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-background p-4 border-b border-border">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <MessageCircle className="w-4 h-4 text-blue-500" />
            <span>{sortedPosts.length} Active Discussions</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-500" />
            <span>1,247 Online Members</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-purple-500" />
            <span>89 Posts Today</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-4">
          {sortedPosts.map((post) => (
            <Card key={post.id} className={`hover:shadow-lg transition-all duration-200 cursor-pointer ${post.pinned ? 'ring-2 ring-blue-500/20 bg-blue-50/30 dark:bg-blue-950/20' : ''} ${post.urgent ? 'ring-2 ring-red-500/20 bg-red-50/30 dark:bg-red-950/20' : ''}`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={post.author.avatar} />
                      <AvatarFallback>{post.author.username[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {post.pinned && <Pin className="w-4 h-4 text-blue-500" />}
                        {post.urgent && <span className="text-red-500 font-bold text-xs">URGENT</span>}
                        <h3 className="font-semibold text-lg hover:text-blue-600 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-medium text-sm">{post.author.username}</span>
                        {post.author.role && (
                          <Badge className={getRoleColor(post.author.role)} variant="secondary">
                            {post.author.role}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">@{post.author.robloxUsername}</span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {post.content}
                      </p>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mb-3">
                        {post.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            #{tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right text-xs text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Clock className="w-3 h-3" />
                      <span>{post.timestamp}</span>
                    </div>
                    <div>Last activity: {post.lastActivity}</div>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{post.views} views</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageSquare className="w-4 h-4" />
                      <span>{post.replies} replies</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {post.category.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950">
                        <ArrowUp className="w-4 h-4" />
                        <span className="ml-1">{post.upvotes}</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950">
                        <ArrowDown className="w-4 h-4" />
                        <span className="ml-1">{post.downvotes}</span>
                      </Button>
                    </div>
                    
                    <Button size="sm" variant="outline">
                      Reply
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {sortedPosts.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
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