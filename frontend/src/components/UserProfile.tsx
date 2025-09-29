import React, { useState, useEffect } from 'react';
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
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { 
 
  Star, 
  Calendar, 
  MessageSquare, 
  TrendingUp,

  Edit,

  Heart,
  Clock,
  CheckCircle,

  Loader2,
  AlertCircle,
  Camera,
  Save,
  X,
  Trophy
} from 'lucide-react';

export function UserProfile() {
  const { user } = useAuth();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState<any>(null); // TODO: Define proper interface
  const [wishlistItems, setWishlistItems] = useState<any[]>([]); // TODO: Define proper interface
  const [selectedAvatar, setSelectedAvatar] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  
  const [editForm, setEditForm] = useState({
    bio: '',
    discordUsername: '',
    timezone: '',
    robloxUsername: ''
  });

  // Load user data on component mount
  const loadProfileData = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Loading profile data...');
      const data = await apiService.getCurrentUser();
      console.log('Profile data loaded:', data);
      setProfileData(data);
    } catch (err: unknown) {
      console.error('Error loading profile:', err);
      // Fallback to user context data if API fails
      if (user) {
        console.log('Using fallback user data:', user);
        setProfileData({
          username: user.username,
          email: user.email,
          role: user.role,
          id: user.id,
          createdAt: new Date().toISOString(),
          bio: '',
          discord_username: '',
          timezone: '',
          roblox_username: '',
          avatar_url: '',
          totalTrades: 0,
          successRate: 0,
          averageRating: 0,
          totalVouches: 0,
          credibility_score: 0,
          totalWishlistItems: 0,
          recentTrades: [],
          vouches: [],
          achievements: []
        });
        setError('');
      } else {
        setError(err instanceof Error ? err.message : 'Failed to load profile data');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadWishlist = async () => {
    if (!user?.id) return;
    
    try {
      const wishlist = await apiService.getUserWishlist(user.id);
      setWishlistItems(wishlist);
    } catch (err: unknown) {
      console.error('Error loading wishlist:', err);
      // Don't set error state for wishlist, just log it
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await loadProfileData();
      if (user?.id) {
        await loadWishlist();
      }
    };
    
    loadData();
  }, [user?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast.error('Avatar file too large (max 2MB)');
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      
      setSelectedAvatar(file);
      
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatar) return;
    
    try {
      setSaving(true);
      const result = await apiService.uploadAvatar(selectedAvatar);
      
      // Update profile data with new avatar
      setProfileData((prev: any) => ({
        ...prev,
        avatar_url: result.avatar_url
      }));
      
      setSelectedAvatar(null);
      setAvatarPreview('');
      toast.success('Avatar updated successfully!');
    } catch (err: unknown) {
      console.error('Failed to upload avatar:', err);
      toast.error(err instanceof Error ? err.message : 'Failed to upload avatar');
    } finally {
      setSaving(false);
    }
  };

  const handleEditProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setError('');
      
      await apiService.updateProfile({
        robloxUsername: editForm.robloxUsername,
        bio: editForm.bio,
        discordUsername: editForm.discordUsername,
        timezone: editForm.timezone
      });
      
      // Reload user data to get updated info
      await loadProfileData();
      
      setIsEditDialogOpen(false);
      toast.success('Profile updated successfully!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update profile';
      console.error('Failed to update profile:', err);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  const handleAddToWishlist = async (itemName: string) => {
    try {
      await apiService.addToWishlist(itemName);
      await loadWishlist();
      toast.success('Item added to wishlist!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add item to wishlist';
      toast.error(errorMessage);
    }
  };

  const handleRemoveFromWishlist = async (wishlistId: string) => {
    try {
      await apiService.removeFromWishlist(wishlistId);
      await loadWishlist();
      toast.success('Item removed from wishlist!');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove item from wishlist';
      toast.error(errorMessage);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error && !profileData) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadProfileData}>
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
          <div className="flex items-center gap-4">
            <div className="relative">
              <Avatar className="w-20 h-20">
                <AvatarImage src={avatarPreview || profileData?.avatar_url || `http://localhost:5000${profileData?.avatar_url}`} />
                <AvatarFallback className="text-2xl">{profileData?.username?.[0] || user?.username?.[0] || 'U'}</AvatarFallback>
              </Avatar>
              <label className="absolute bottom-0 right-0 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-1.5 cursor-pointer transition-colors">
                <Camera className="w-3 h-3" />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarSelect}
                  className="hidden"
                />
              </label>
              {selectedAvatar && (
                <div className="absolute -top-2 -right-2 flex gap-1">
                  <Button
                    size="sm"
                    onClick={handleAvatarUpload}
                    disabled={saving}
                    className="h-6 px-2 bg-green-500 hover:bg-green-600"
                  >
                    {saving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => {
                      setSelectedAvatar(null);
                      setAvatarPreview('');
                    }}
                    className="h-6 px-2"
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">
                {profileData?.username || user?.username || 'User'}
                {profileData?.role && ['admin', 'moderator', 'mm', 'mw'].includes(profileData.role) && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                    ✓ {profileData.role.toUpperCase()}
                  </Badge>
                )}
              </h1>
              <p className="text-muted-foreground">@{profileData?.roblox_username || 'Not set'}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < (profileData?.averageRating || 0) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">({profileData?.totalVouches || 0} vouches)</span>
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
                  <Label htmlFor="roblox">Roblox Username</Label>
                  <Input
                    id="roblox"
                    value={editForm.robloxUsername}
                    onChange={(e) => setEditForm(prev => ({ ...prev, robloxUsername: e.target.value }))}
                    placeholder="Enter your Roblox username"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={editForm.bio}
                    onChange={(e) => setEditForm(prev => ({ ...prev, bio: e.target.value }))}
                    className="min-h-[100px]"
                    placeholder="Tell others about yourself..."
                    maxLength={500}
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {editForm.bio.length}/500 characters
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="discord">Discord Username</Label>
                  <Input
                    id="discord"
                    value={editForm.discordUsername}
                    onChange={(e) => setEditForm(prev => ({ ...prev, discordUsername: e.target.value }))}
                    placeholder="username#1234"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Input
                    id="timezone"
                    value={editForm.timezone}
                    onChange={(e) => setEditForm(prev => ({ ...prev, timezone: e.target.value }))}
                    placeholder="EST (UTC-5)"
                  />
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={saving}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
                    )}
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
                        <p className="text-2xl font-bold">{profileData?.totalTrades || 0}</p>
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
                        <p className="text-2xl font-bold">{profileData?.successRate || 0}%</p>
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
                        <p className="text-2xl font-bold">{profileData?.averageRating?.toFixed(1) || '0.0'}</p>
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
                        <p className="text-2xl font-bold">
                          {profileData?.createdAt ? new Date(profileData.createdAt).getFullYear() : 'N/A'}
                        </p>
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
                    <p className="text-muted-foreground mb-4">
                      {profileData?.bio || 'No bio provided yet.'}
                    </p>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="w-4 h-4" />
                        <span>Joined {profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'Unknown'}</span>
                      </div>
                      {profileData?.discord_username && (
                        <div className="flex items-center gap-2 text-sm">
                          <MessageSquare className="w-4 h-4" />
                          <span>Discord: {profileData.discord_username}</span>
                        </div>
                      )}
                      {profileData?.timezone && (
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4" />
                          <span>Timezone: {profileData.timezone}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Quick Stats</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Credibility Score</span>
                      <span className="font-medium">{profileData?.credibility_score || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Vouches</span>
                      <span className="font-medium">{profileData?.totalVouches || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Wishlist Items</span>
                      <span className="font-medium">{profileData?.totalWishlistItems || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Account Status</span>
                      <span className="font-medium text-green-600">Active</span>
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
                  {profileData?.recentTrades && profileData.recentTrades.length > 0 ? (
                    <div className="space-y-4">
                      {profileData.recentTrades.map((trade: { _id: string; title: string; status: string; created_at: string; item_offered?: string; item_requested?: string }) => (
                        <div key={trade._id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              trade.status === 'completed' ? 'bg-green-500' : 
                              trade.status === 'active' ? 'bg-blue-500' : 
                              'bg-yellow-500'
                            }`} />
                            <div>
                              <p className="font-medium">{trade.item_offered || trade.title}</p>
                              <p className="text-sm text-muted-foreground">{trade.item_requested ? `for ${trade.item_requested}` : 'Trade post'}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <Badge variant={
                              trade.status === 'completed' ? 'default' : 
                              trade.status === 'active' ? 'secondary' : 
                              'outline'
                            }>
                              {trade.status}
                            </Badge>
                            <p className="text-sm text-muted-foreground mt-1">
                              {new Date(trade.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <TrendingUp className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No trades yet</h3>
                      <p className="text-muted-foreground">Start trading to build your history!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="wishlist" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    My Wishlist
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Heart className="w-4 h-4 mr-2" />
                          Add Item
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add to Wishlist</DialogTitle>
                          <DialogDescription>
                            Add an item you're looking for to your wishlist
                          </DialogDescription>
                        </DialogHeader>
                        <form onSubmit={(e) => {
                          e.preventDefault();
                          const formData = new FormData(e.target as HTMLFormElement);
                          const itemName = formData.get('itemName') as string;
                          if (itemName) {
                            handleAddToWishlist(itemName);
                          }
                        }} className="space-y-4">
                          <div>
                            <Label htmlFor="itemName">Item Name</Label>
                            <Input
                              id="itemName"
                              name="itemName"
                              placeholder="Enter item name..."
                              required
                            />
                          </div>
                          <div className="flex justify-end gap-2">
                            <DialogTrigger asChild>
                              <Button type="button" variant="outline">Cancel</Button>
                            </DialogTrigger>
                            <Button type="submit">Add Item</Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {wishlistItems.length > 0 ? (
                    <div className="space-y-4">
                      {wishlistItems.map((item: { wishlist_id: string; item_name: string; created_at: string }) => (
                        <div key={item.wishlist_id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <Heart className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium">{item.item_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Added {new Date(item.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleRemoveFromWishlist(item.wishlist_id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No wishlist items</h3>
                      <p className="text-muted-foreground">Add items you're looking for!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="vouches" className="space-y-4">
              {profileData?.vouches && profileData.vouches.length > 0 ? (
                profileData.vouches.map((vouch: { _id: string; given_by: string; rating: number; comment: string; createdAt: string }) => (
                  <Card key={vouch._id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{vouch.given_by[0]}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{vouch.given_by}</span>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-3 h-3 ${i < vouch.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">{vouch.comment}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(vouch.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <Card>
                  <CardContent className="text-center py-8">
                    <Star className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No vouches yet</h3>
                    <p className="text-muted-foreground">Complete trades to receive vouches from other users!</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {profileData?.achievements && profileData.achievements.length > 0 ? profileData.achievements.map((achievement: { id: string; title: string; name?: string; description: string; date: string; earned?: boolean; icon?: React.ComponentType }) => (
                  <Card key={achievement.id} className={`${achievement.earned ? 'border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-950/50' : 'opacity-60'}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${achievement.earned ? 'bg-green-100 dark:bg-green-900' : 'bg-gray-100 dark:bg-gray-800'}`}>
                          <Trophy className={`w-5 h-5 ${achievement.earned ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`} />
                        </div>
                        <div>
                          <p className="font-medium">{achievement.name || achievement.title}</p>
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
                )) : (
                  <Card>
                    <CardContent className="text-center py-8">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-medium mb-2">No achievements yet</h3>
                      <p className="text-muted-foreground">Complete trades and activities to earn achievements!</p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}