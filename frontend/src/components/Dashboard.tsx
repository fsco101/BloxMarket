import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
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
  Megaphone
} from 'lucide-react';

export function Dashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock data
  const posts = [
    {
      id: 1,
      type: 'trade',
      title: 'Trading Dominus Empyreus for Robux',
      description: 'Looking to trade my Dominus Empyreus for 50k Robux or equivalent value items. Serious offers only!',
      user: {
        username: 'TradeMaster99',
        robloxUsername: 'TradeMaster99',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 47
      },
      items: ['Dominus Empyreus'],
      wantedItems: ['50k Robux'],
      timestamp: '2 hours ago',
      comments: 12,
      likes: 24,
      image: 'https://images.unsplash.com/photo-1658856413378-288069d87d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0cmFkaW5nJTIwY2FyZHMlMjBkaWdpdGFsJTIwaXRlbXN8ZW58MXx8fHwxNzU4NTYwNDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 2,
      type: 'giveaway',
      title: '🎉 HUGE GIVEAWAY - 100k Robux + Rare Items!',
      description: 'Celebrating 10k members! Giving away 100k Robux, Dominus, and other rare items. Follow the rules to enter!',
      user: {
        username: 'BloxMarketOfficial',
        robloxUsername: 'BloxMarketOfficial',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 999,
        verified: true
      },
      timestamp: '4 hours ago',
      comments: 234,
      likes: 567,
      entries: 1245
    },
    {
      id: 3,
      type: 'wishlist',
      title: 'Looking for Valk Helm - Paying Premium',
      description: 'Been searching for this item for months! Will pay above market value. Contact me if you have one.',
      user: {
        username: 'CollectorPro',
        robloxUsername: 'CollectorPro',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 18
      },
      wantedItems: ['Valk Helm'],
      offering: '25k Robux',
      timestamp: '6 hours ago',
      comments: 8,
      likes: 15
    },
    {
      id: 4,
      type: 'announcement',
      title: '📢 New Trading Rules & Safety Guidelines',
      description: 'Important updates to our community trading rules. Please read carefully to ensure safe trading practices.',
      user: {
        username: 'ModeratorTeam',
        robloxUsername: 'ModeratorTeam',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 0,
        verified: true,
        moderator: true
      },
      timestamp: '1 day ago',
      comments: 45,
      likes: 123,
      pinned: true
    }
  ];

  const getPostTypeIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-4 h-4" />;
      case 'giveaway': return <Gift className="w-4 h-4" />;
      case 'wishlist': return <Heart className="w-4 h-4" />;
      case 'announcement': return <Megaphone className="w-4 h-4" />;
      default: return <MessageSquare className="w-4 h-4" />;
    }
  };

  const getPostTypeColor = (type: string) => {
    switch (type) {
      case 'trade': return 'bg-blue-500';
      case 'giveaway': return 'bg-green-500';
      case 'wishlist': return 'bg-purple-500';
      case 'announcement': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || post.type === filterType;
    return matchesSearch && matchesFilter;
  });

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
                <SelectItem value="giveaway">Giveaways</SelectItem>
                <SelectItem value="wishlist">Wishlists</SelectItem>
                <SelectItem value="announcement">News</SelectItem>
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
            <span>2,847 Active Traders</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span>156 Active Trades</span>
          </div>
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-500" />
            <span>12 Live Giveaways</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {filteredPosts.map((post) => (
            <Card key={post.id} className={`relative ${post.pinned ? 'ring-2 ring-orange-500/20 bg-orange-50/30 dark:bg-orange-950/20' : ''}`}>
              {post.pinned && (
                <div className="absolute -top-2 left-4 bg-orange-500 text-white text-xs px-2 py-1 rounded-full">
                  PINNED
                </div>
              )}
              
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={post.user.avatar} />
                      <AvatarFallback>{post.user.username[0]}</AvatarFallback>
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
                        <span>@{post.user.robloxUsername}</span>
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
                  </div>
                )}

                {/* Wishlist Details */}
                {post.type === 'wishlist' && (
                  <div className="flex flex-wrap gap-4 p-3 bg-muted/30 rounded-lg">
                    <div>
                      <span className="text-sm text-muted-foreground">Wanted:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {post.wantedItems?.map((item, i) => (
                          <Badge key={i} variant="outline" className="bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300">
                            {item}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Offering:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300 ml-1">
                        {post.offering}
                      </Badge>
                    </div>
                  </div>
                )}

                {/* Giveaway Details */}
                {post.type === 'giveaway' && post.entries && (
                  <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Giveaway Entries:</span>
                      <Badge className="bg-green-500 text-white">{post.entries} entries</Badge>
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