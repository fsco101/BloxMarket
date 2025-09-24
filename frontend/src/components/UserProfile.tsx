import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { useAuth } from '../App';
import { 
  User, 
  Star, 
  Calendar, 
  MessageSquare, 
  TrendingUp,
  Settings,
  Edit,
  Shield,
  Award,
  Heart,
  Clock,
  CheckCircle
} from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  const [editForm, setEditForm] = useState({
    bio: 'Experienced trader with 3+ years in the Roblox community. Specializing in limited items and high-value trades. Always fair and honest!',
    discordUsername: 'TradeMaster99#1234',
    timezone: 'EST (UTC-5)'
  });

  // Mock profile data
  const profileData = {
    joinDate: '2022-01-15',
    totalTrades: 347,
    successRate: 98.5,
    totalValue: '2.4M Robux',
    favoriteItems: ['Dominus Items', 'Valkyrie Helms', 'Event Items'],
    achievements: [
      { id: 1, name: 'Verified Trader', description: 'Completed identity verification', icon: Shield, earned: true },
      { id: 2, name: 'Top Trader', description: '100+ successful trades', icon: Award, earned: true },
      { id: 3, name: 'Community Favorite', description: '50+ positive vouches', icon: Heart, earned: true },
      { id: 4, name: 'Early Adopter', description: 'Joined in first year', icon: Calendar, earned: true },
      { id: 5, name: 'High Roller', description: '1M+ Robux in trades', icon: TrendingUp, earned: true },
      { id: 6, name: 'Perfect Record', description: '99%+ success rate', icon: CheckCircle, earned: false }
    ]
  };

  const recentTrades = [
    {
      id: 1,
      type: 'completed',
      item: 'Dominus Empyreus',
      value: '75,000 Robux',
      partner: 'CollectorPro',
      date: '2 days ago',
      status: 'success'
    },
    {
      id: 2,
      type: 'completed',
      item: 'Valk Helm Bundle',
      value: '45,000 Robux',
      partner: 'ValkMaster',
      date: '1 week ago',
      status: 'success'
    },
    {
      id: 3,
      type: 'completed',
      item: 'Event Item Collection',
      value: '23,000 Robux',
      partner: 'EventHunter',
      date: '2 weeks ago',
      status: 'success'
    }
  ];

  const wishlistItems = [
    { id: 1, name: 'Dominus Frigidus', maxPrice: '85,000 Robux', priority: 'high' },
    { id: 2, name: 'Sparkle Time Fedora', maxPrice: '12,000 Robux', priority: 'medium' },
    { id: 3, name: 'Zombie Attack Backpack', maxPrice: '5,000 Robux', priority: 'low' }
  ];

  const vouches = [
    {
      id: 1,
      from: 'TrustedTrader',
      rating: 5,
      comment: 'Excellent trader! Fast, reliable, and trustworthy. Highly recommend!',
      date: '3 days ago',
      verified: true
    },
    {
      id: 2,
      from: 'CollectorPro',
      rating: 5,
      comment: 'Smooth transaction, great communication throughout the process.',
      date: '1 week ago',
      verified: true
    },
    {
      id: 3,
      from: 'SafeTrader123',
      rating: 4,
      comment: 'Good trader, would trade again. Minor delay but overall positive experience.',
      date: '2 weeks ago',
      verified: false
    }
  ];

  const handleEditProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock profile update
    console.log('Updating profile:', editForm);
    setIsEditDialogOpen(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="w-20 h-20">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-2xl">{user?.username?.[0] || 'U'}</AvatarFallback>
            </Avatar>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {user?.username || 'User'}
                <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                  ✓ Verified
                </Badge>
              </h1>
              <p className="text-muted-foreground">@{user?.robloxUsername || 'username'}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (user?.rating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({user?.vouchCount || 0} vouches)</span>
              </div>
            </div>
          </div>
          
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit Profile
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Update your profile information
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleEditProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discord">Discord Username</Label>
                  <Input
                    id="discord"
                    value={editForm.discordUsername}
                    onChange={(e) => setEditForm(prev => ({ ...prev, discordUsername: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={editForm.timezone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, timezone: e.target.value }))}
                  />
                </div>
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    Save Changes
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="trades">Trade History</TabsTrigger>
              <TabsTrigger value="wishlist">Wishlist</TabsTrigger>
              <TabsTrigger value="vouches">Vouches</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Trades</p>
                        <p className="text-2xl font-bold">{profileData.totalTrades}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">{profileData.successRate}%</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Average Rating</p>
                        <p className="text-2xl font-bold">{user?.rating || 0}.0</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Member Since</p>
                        <p className="text-2xl font-bold">2022</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Bio and Info */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>About</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{editForm.bio}</p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {new Date(profileData.joinDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4" />
                        <span>Discord: {editForm.discordUsername}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="w-4 h-4" />
                        <span>Timezone: {editForm.timezone}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Value Traded</span>
                      <span className="font-medium">{profileData.totalValue}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Active Listings</span>
                      <span className="font-medium">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Wishlist Items</span>
                      <span className="font-medium">{wishlistItems.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Response Time</span>
                      <span className="font-medium">&lt; 30 min</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trades" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Trade History</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentTrades.map((trade) => (
                      <div key={trade.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-3 h-3 rounded-full ${trade.status === 'success' ? 'bg-green-500' : 'bg-red-500'}`} />
                          <div>
                            <p className="font-medium">{trade.item}</p>
                            <p className="text-sm text-muted-foreground">with @{trade.partner}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600 dark:text-green-400">{trade.value}</p>
                          <p className="text-sm text-muted-foreground">{trade.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>My Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {wishlistItems.map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <Heart className="w-5 h-5 text-red-500" />
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-muted-foreground">Max: {item.maxPrice}</p>
                          </div>
                        </div>
                        <Badge className={getPriorityColor(item.priority)}>
                          {item.priority} priority
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vouches" className="space-y-4">
              {vouches.map((vouch) => (
                <Card key={vouch.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>{vouch.from[0]}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{vouch.from}</span>
                          {vouch.verified && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              ✓ Verified
                            </Badge>
                          )}
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`w-3 h-3 ${i < vouch.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{vouch.comment}</p>
                        <p className="text-xs text-muted-foreground">{vouch.date}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData.achievements.map((achievement) => (
                  <Card key={achievement.id} className={`${achievement.earned ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50' : 'opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <achievement.icon className={`w-5 h-5 ${achievement.earned ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.name}</p>
                          <p className="text-xs text-muted-foreground">{achievement.description}</p>
                        </div>
                      </div>
                      {achievement.earned && (
                        <Badge className="mt-2 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Earned
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}