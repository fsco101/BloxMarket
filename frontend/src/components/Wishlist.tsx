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
import { 
  Plus, 
  Search, 
  Heart, 
  Star, 
  MessageSquare, 
  Clock,
  DollarSign,
  TrendingUp,
  Filter
} from 'lucide-react';

export function Wishlist() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  
  const [newWishlist, setNewWishlist] = useState({
    itemName: '',
    description: '',
    maxPrice: '',
    category: '',
    priority: 'medium'
  });

  // Mock wishlist data
  const wishlistItems = [
    {
      id: 1,
      itemName: 'Dominus Empyreus',
      description: 'Looking for this rare dominus for my collection. Will pay premium price for good condition.',
      user: {
        username: 'DominusHunter',
        robloxUsername: 'DominusHunter2024',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 5,
        vouchCount: 67
      },
      maxPrice: '75,000 Robux',
      category: 'limiteds',
      priority: 'high',
      timestamp: '2 hours ago',
      watchers: 15,
      offers: 3
    },
    {
      id: 2,
      itemName: 'Valk Helm of the Space Crusader',
      description: 'Been searching for this for months! Willing to pay above market value.',
      user: {
        username: 'ValkCollector',
        robloxUsername: 'ValkCollector',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 89
      },
      maxPrice: '25,000 Robux',
      category: 'accessories',
      priority: 'medium',
      timestamp: '1 day ago',
      watchers: 8,
      offers: 1
    },
    {
      id: 3,
      itemName: 'Zombie Attack Backpack',
      description: 'Need this for my zombie-themed avatar. Reasonable offers only please.',
      user: {
        username: 'ZombieAvatar',
        robloxUsername: 'ZombieAvatar',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 3,
        vouchCount: 12
      },
      maxPrice: '5,000 Robux',
      category: 'event-items',
      priority: 'low',
      timestamp: '3 days ago',
      watchers: 4,
      offers: 0
    }
  ];

  const categories = [
    { value: 'all', label: 'All Categories' },
    { value: 'limiteds', label: 'Limited Items' },
    { value: 'accessories', label: 'Accessories' },
    { value: 'gear', label: 'Gear' },
    { value: 'event-items', label: 'Event Items' },
    { value: 'gamepasses', label: 'Gamepasses' }
  ];

  const handleCreateWishlist = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock wishlist creation
    console.log('Creating wishlist item:', newWishlist);
    setIsCreateDialogOpen(false);
    setNewWishlist({
      itemName: '',
      description: '',
      maxPrice: '',
      category: '',
      priority: 'medium'
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const filteredItems = wishlistItems.filter(item => {
    const matchesSearch = item.itemName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Community Wishlist</h1>
            <p className="text-muted-foreground">See what the community is looking for</p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add to Wishlist
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Add Item to Wishlist</DialogTitle>
                <DialogDescription>
                  Let others know what you're looking for
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateWishlist} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="item-name">Item Name</Label>
                  <Input
                    id="item-name"
                    placeholder="Enter the item name"
                    value={newWishlist.itemName}
                    onChange={(e) => setNewWishlist(prev => ({ ...prev, itemName: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item-description">Description</Label>
                  <Textarea
                    id="item-description"
                    placeholder="Why do you want this item?"
                    value={newWishlist.description}
                    onChange={(e) => setNewWishlist(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[80px]"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="max-price">Max Price</Label>
                    <Input
                      id="max-price"
                      placeholder="e.g., 10,000 Robux"
                      value={newWishlist.maxPrice}
                      onChange={(e) => setNewWishlist(prev => ({ ...prev, maxPrice: e.target.value }))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Select value={newWishlist.priority} onValueChange={(value) => setNewWishlist(prev => ({ ...prev, priority: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High Priority</SelectItem>
                        <SelectItem value="medium">Medium Priority</SelectItem>
                        <SelectItem value="low">Low Priority</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="wishlist-category">Category</Label>
                  <Select value={newWishlist.category} onValueChange={(value) => setNewWishlist(prev => ({ ...prev, category: value }))}>
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
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
                    Add to Wishlist
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
              placeholder="Search wishlist items..."
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
        </div>
      </div>

      {/* Stats */}
      <div className="bg-background p-4 border-b border-border">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Heart className="w-4 h-4 text-red-500" />
            <span>{filteredItems.length} Wishlist Items</span>
          </div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span>89% Match Rate</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span>2.4M Total Value</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {filteredItems.map((item) => (
            <Card key={item.id} className="hover:shadow-lg transition-all duration-200">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={item.user.avatar} />
                      <AvatarFallback>{item.user.username[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{item.user.username}</span>
                        <div className="flex items-center gap-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < item.user.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">({item.user.vouchCount})</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">@{item.user.robloxUsername}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge className={getPriorityColor(item.priority)}>
                      {item.priority} priority
                    </Badge>
                    <Badge variant="outline">{item.category}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-red-500" />
                    {item.itemName}
                  </h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>

                {/* Price and Details */}
                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">Max Budget:</span>
                      <p className="font-semibold text-green-600 dark:text-green-400">{item.maxPrice}</p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">Category:</span>
                      <p className="font-medium capitalize">{item.category.replace('-', ' ')}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3" />
                        <span>{item.watchers} watching</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageSquare className="w-3 h-3" />
                        <span>{item.offers} offers</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{item.timestamp}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <div className="flex items-center gap-3">
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-red-500">
                      <Heart className="w-4 h-4 mr-1" />
                      Watch
                    </Button>
                    <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                      <MessageSquare className="w-4 h-4 mr-1" />
                      Comment
                    </Button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                      Make Offer
                    </Button>
                    <Button variant="outline" size="sm">
                      Contact Seller
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredItems.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No wishlist items found</h3>
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