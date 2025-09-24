import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { 
  Plus, 
  Search, 
  Filter, 
  Star, 
  MessageSquare, 
  TrendingUp,
  Clock,
  ArrowRight
} from 'lucide-react';

export function TradingHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newTrade, setNewTrade] = useState({
    title: '',
    description: '',
    offering: '',
    wanting: '',
    category: '',
    contactMethod: 'dm'
  });

  // Mock trades data
  const trades = [
    {
      id: 1,
      title: 'Trading Rare Dominus Collection',
      description: 'Looking to trade my collection of rare Dominus items for Robux or other high-value items. Serious traders only!',
      user: {
        username: 'DominusKing',
        robloxUsername: 'DominusKing2024',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 89,
        verified: true
      },
      offering: ['Dominus Empyreus', 'Dominus Frigidus', 'Dominus Messor'],
      wanting: ['100k+ Robux', 'Rare Limiteds'],
      category: 'limiteds',
      value: '150k+ Robux',
      timestamp: '1 hour ago',
      status: 'active',
      views: 234,
      interested: 12
    },
    {
      id: 2,
      title: 'Selling Rare Event Items - Quick Sale!',
      description: 'Need to sell these rare event items quickly. Below market price for fast sale!',
      user: {
        username: 'EventCollector',
        robloxUsername: 'EventCollector',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 156
      },
      offering: ['Zombie Attack Backpack', 'Bling Bag', 'Sparkle Time Bag'],
      wanting: ['Robux', 'PayPal'],
      category: 'event-items',
      value: '25k Robux',
      timestamp: '3 hours ago',
      status: 'active',
      views: 189,
      interested: 8
    },
    {
      id: 3,
      title: 'Looking for Specific Face Accessories',
      description: 'Collecting face accessories for my avatar. Will pay premium for rare ones!',
      user: {
        username: 'FaceCollector',
        robloxUsername: 'FaceCollector',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 3,
        vouchCount: 23
      },
      offering: ['15k Robux', 'Various Limiteds'],
      wanting: ['Sshf', 'Crunk Face', 'Epic Face'],
      category: 'accessories',
      value: '15k Robux',
      timestamp: '5 hours ago',
      status: 'active',
      views: 67,
      interested: 3
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'limiteds', label: 'Limited Items' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'gear', label: 'Gear' },
    { value: 'event-items', label: 'Event Items' },
    { value: 'robux', label: 'Robux' },
    { value: 'gamepasses', label: 'Gamepasses' }
  ];

  const handleCreateTrade = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock trade creation
    console.log('Creating trade:', newTrade);
    setIsCreateDialogOpen(false);
    setNewTrade({
      title: '',
      description: '',
      offering: '',
      wanting: '',
      category: '',
      contactMethod: 'dm'
    });
  };

  const filteredTrades = trades.filter(trade => {
    const matchesSearch = trade.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         trade.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || trade.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Trading Hub</h1>
            <p className="text-muted-foreground">Discover and create trades with the community</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Trade
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Create New Trade</DialogTitle>
                <DialogDescription>
                  Fill out the details for your trade listing
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateTrade} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="trade-title">Trade Title</Label>
                  <Input
                    id="trade-title"
                    placeholder="Enter a catchy title for your trade"
                    value={newTrade.title}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trade-description">Description</Label>
                  <Textarea
                    id="trade-description"
                    placeholder="Describe your trade in detail..."
                    value={newTrade.description}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="offering">What you're offering</Label>
                    <Textarea
                      id="offering"
                      placeholder="List items you're trading away..."
                      value={newTrade.offering}
                      onChange={(e) => setNewTrade(prev => ({ ...prev, offering: e.target.value }))}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="wanting">What you want</Label>
                    <Textarea
                      id="wanting"
                      placeholder="List items you're looking for..."
                      value={newTrade.wanting}
                      onChange={(e) => setNewTrade(prev => ({ ...prev, wanting: e.target.value }))}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select value={newTrade.category} onValueChange={(value) => setNewTrade(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.filter(cat => cat.value !== 'all').map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="contact-method">Preferred Contact Method</Label>
                  <Select value={newTrade.contactMethod} onValueChange={(value) => setNewTrade(prev => ({ ...prev, contactMethod: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dm">Direct Message</SelectItem>
                      <SelectItem value="discord">Discord</SelectItem>
                      <SelectItem value="roblox">Roblox Messages</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white">
                    Create Trade
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search trades..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-48">
              <Filter className="w-4 h-4 mr-2" />
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
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="value-high">Highest Value</SelectItem>
              <SelectItem value="value-low">Lowest Value</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-background p-4 border-b border-border">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>{filteredTrades.length} Active Trades</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>24 Trades Today</span>
          </div>
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500" />
            <span>98% Success Rate</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTrades.map((trade) => (
              <Card key={trade.id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={trade.user.avatar} />
                        <AvatarFallback>{trade.user.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm">{trade.user.username}</span>
                          {trade.user.verified && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              ✓
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-2.5 h-2.5 ${i < trade.user.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span>({trade.user.vouchCount})</span>
                        </div>
                      </div>
                    </div>
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                      {trade.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div>
                    <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                      {trade.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {trade.description}
                    </p>
                  </div>

                  {/* Trade Items */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Offering:</span>
                      <div className="flex flex-wrap gap-1">
                        {trade.offering.slice(0, 2).map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                            {item}
                          </Badge>
                        ))}
                        {trade.offering.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{trade.offering.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-center">
                      <ArrowRight className="w-4 h-4 text-muted-foreground" />
                    </div>

                    <div>
                      <span className="text-xs text-muted-foreground mb-1 block">Looking for:</span>
                      <div className="flex flex-wrap gap-1">
                        {trade.wanting.slice(0, 2).map((item, i) => (
                          <Badge key={i} variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                            {item}
                          </Badge>
                        ))}
                        {trade.wanting.length > 2 && (
                          <Badge variant="outline" className="text-xs">
                            +{trade.wanting.length - 2} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Value and Stats */}
                  <div className="pt-2 border-t border-border">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>Est. Value: {trade.value}</span>
                      <span>{trade.timestamp}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{trade.views} views</span>
                      <span>{trade.interested} interested</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Contact
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredTrades.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No trades found</h3>
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