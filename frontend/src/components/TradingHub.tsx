import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { apiService } from '../services/api';
import { toast } from 'sonner';
import { 
  Plus, 
  Search, 
  Filter, 
  MessageSquare, 
  TrendingUp,
  Clock,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
  X,
  Edit
} from 'lucide-react';

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
  images?: { image_url: string; uploaded_at: string }[];
  user_id?: string;
}

interface User {
  id: string;
  username: string;
  email: string;
  robloxUsername?: string;
}

interface ImageDisplayProps {
  src: string;
  alt: string;
  className?: string;
  fallback?: React.ReactNode;
}

function ImageDisplay({ src, alt, className, fallback }: ImageDisplayProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    if (retryCount < 2) {
      // Retry loading the image up to 2 times
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
        setImageError(false);
        setImageLoading(true);
      }, 1000);
    } else {
      setImageLoading(false);
      setImageError(true);
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setImageError(false);
    setImageLoading(true);
  };

  if (imageError) {
    return fallback || (
      <div className={`bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${className}`}>
        <div className="text-center text-gray-400">
          <Upload className="w-8 h-8 mx-auto mb-1" />
          <span className="text-xs block mb-1">Image unavailable</span>
          <button
            onClick={handleRetry}
            className="text-xs text-blue-500 hover:text-blue-600 underline focus:outline-none"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-100 dark:bg-gray-800 flex items-center justify-center rounded">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      )}
      <img
        src={`${src}?v=${retryCount}`} // Add cache-busting parameter
        alt={alt}
        className={`w-full h-full object-cover rounded ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />
    </div>
  );
}

export function TradingHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [newTrade, setNewTrade] = useState({
    itemOffered: '',
    itemRequested: '',
    description: ''
  });

  const [editTrade, setEditTrade] = useState({
    itemOffered: '',
    itemRequested: '',
    description: ''
  });

  // Image upload states
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviewUrls, setImagePreviewUrls] = useState<string[]>([]);
  const [editSelectedImages, setEditSelectedImages] = useState<File[]>([]);
  const [editImagePreviewUrls, setEditImagePreviewUrls] = useState<string[]>([]);

  const loadTrades = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params: Record<string, string | number> = {
        page: currentPage,
        limit: 10
      };
      
      if (filterCategory !== 'all') {
        params.status = filterCategory;
      }
      
      const response = await apiService.getTrades(params);
      setTrades(response.trades || []);
      if (response.pagination) {
        setTotalPages(response.pagination.totalPages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load trades');
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterCategory]);

  // Load current user
  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        console.log('Loading current user...');
        const user = await apiService.getCurrentUser();
        console.log('Current user loaded:', user);
        setCurrentUser(user);
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    };
    
    console.log('Auth check:', apiService.isAuthenticated());
    if (apiService.isAuthenticated()) {
      loadCurrentUser();
    }
  }, []);

  // Load trades from API
  useEffect(() => {
    loadTrades();
  }, [loadTrades]);

  const categories = [
    { value: 'all', label: 'All Trades' },
    { value: 'open', label: 'Open' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Image handling functions
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + selectedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setSelectedImages(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setImagePreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length + editSelectedImages.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return false;
      }
      return true;
    });

    if (validFiles.length > 0) {
      setEditSelectedImages(prev => [...prev, ...validFiles]);
      
      // Create preview URLs
      validFiles.forEach(file => {
        const reader = new FileReader();
        reader.onload = (e) => {
          setEditImagePreviewUrls(prev => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveEditImage = (index: number) => {
    setEditSelectedImages(prev => prev.filter((_, i) => i !== index));
    setEditImagePreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!newTrade.itemOffered.trim()) {
      setError('Item offered is required');
      return;
    }
    if (!newTrade.itemRequested.trim()) {
      setError('Item requested is required');
      return;
    }
    
    try {
      setCreateLoading(true);
      setError('');
      
      console.log('Creating trade with images:', selectedImages.length);
      
      await apiService.createTrade({
        itemOffered: newTrade.itemOffered,
        itemRequested: newTrade.itemRequested,
        description: newTrade.description
      }, selectedImages);
      
      // Reset form
      setIsCreateDialogOpen(false);
      setNewTrade({
        itemOffered: '',
        itemRequested: '',
        description: ''
      });
      setSelectedImages([]);
      setImagePreviewUrls([]);
      
      // Reload trades to show the new one
      await loadTrades();
      
      console.log('Trade created successfully');
      toast.success('Trade created successfully! 🎉', {
        description: 'Your trade has been posted and is now visible to other users.'
      });
    } catch (err) {
      console.error('Failed to create trade:', err);
      let errorMessage = 'Failed to create trade';
      
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('413')) {
          errorMessage = 'Images are too large. Please use smaller images (max 5MB each).';
        } else if (err.message.includes('400')) {
          errorMessage = 'Invalid data. Please check all fields and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error('Failed to create trade', {
        description: errorMessage
      });
    } finally {
      setCreateLoading(false);
    }
  };

  const handleEditTrade = (trade: Trade) => {
    if (!currentUser || currentUser.id !== trade.user_id) {
      toast.error('You can only edit your own trades');
      return;
    }
    
    setEditingTrade(trade);
    setEditTrade({
      itemOffered: trade.item_offered,
      itemRequested: trade.item_requested || '',
      description: trade.description || ''
    });
    setEditSelectedImages([]);
    setEditImagePreviewUrls([]);
    setIsEditDialogOpen(true);
  };

  const handleUpdateTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTrade) return;
    
    // Validation
    if (!editTrade.itemOffered.trim()) {
      setError('Item offered is required');
      return;
    }
    
    try {
      setEditLoading(true);
      setError('');
      
      await apiService.updateTrade(editingTrade.trade_id, {
        itemOffered: editTrade.itemOffered,
        itemRequested: editTrade.itemRequested,
        description: editTrade.description
      }, editSelectedImages);
      
      // Reset form
      setIsEditDialogOpen(false);
      setEditingTrade(null);
      setEditTrade({
        itemOffered: '',
        itemRequested: '',
        description: ''
      });
      setEditSelectedImages([]);
      setEditImagePreviewUrls([]);
      
      // Reload trades to show the updated one
      await loadTrades();
      
      toast.success('Trade updated successfully! 🎉', {
        description: 'Your trade has been updated and is now visible to other users.'
      });
    } catch (err) {
      console.error('Failed to update trade:', err);
      let errorMessage = 'Failed to update trade';
      
      if (err instanceof Error) {
        if (err.message.includes('network') || err.message.includes('fetch')) {
          errorMessage = 'Network error. Please check your connection and try again.';
        } else if (err.message.includes('413')) {
          errorMessage = 'Images are too large. Please use smaller images (max 5MB each).';
        } else if (err.message.includes('400')) {
          errorMessage = 'Invalid data. Please check all fields and try again.';
        } else {
          errorMessage = err.message;
        }
      }
      
      setError(errorMessage);
      toast.error('Failed to update trade', {
        description: errorMessage
      });
    } finally {
      setEditLoading(false);
    }
  };

  const canEditTrade = (trade: Trade) => {
    console.log('canEditTrade check:', {
      currentUser,
      currentUserId: currentUser?.id,
      tradeUserId: trade.user_id,
      match: currentUser && currentUser.id === trade.user_id
    });
    return currentUser && currentUser.id === trade.user_id;
  };

  const filteredTrades = trades.filter((trade) => {
    const matchesSearch = searchTerm === '' || 
      trade.item_offered?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.item_requested?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
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
                  <Label htmlFor="item-offered">What you're offering *</Label>
                  <Input
                    id="item-offered"
                    placeholder="Enter the item you're trading away"
                    value={newTrade.itemOffered}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, itemOffered: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="item-requested">What you want (optional)</Label>
                  <Input
                    id="item-requested"
                    placeholder="Enter what you're looking for"
                    value={newTrade.itemRequested}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, itemRequested: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="trade-description">Description (optional)</Label>
                  <Textarea
                    id="trade-description"
                    placeholder="Add additional details about your trade..."
                    value={newTrade.description}
                    onChange={(e) => setNewTrade(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Images (optional - up to 5 images)</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-4 text-center transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                      if (files.length > 0) {
                        const input = document.getElementById('image-upload') as HTMLInputElement;
                        const dt = new DataTransfer();
                        files.forEach(file => dt.items.add(file));
                        input.files = dt.files;
                        handleImageSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                      disabled={selectedImages.length >= 5}
                    />
                    <label
                      htmlFor="image-upload"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${
                        selectedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {selectedImages.length >= 5 
                          ? 'Maximum 5 images reached' 
                          : 'Click to upload images or drag and drop'
                        }
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 5MB each • {selectedImages.length}/5 selected
                      </span>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {imagePreviewUrls.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {imagePreviewUrls.length} image{imagePreviewUrls.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {imagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              <ImageDisplay
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={createLoading}>
                    Cancel
                  </Button>
                  <Button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" disabled={createLoading}>
                    {createLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Create Trade'
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          
          {/* Edit Trade Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Edit Trade</DialogTitle>
                <DialogDescription>
                  Update the details for your trade listing
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleUpdateTrade} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-item-offered">What you're offering *</Label>
                  <Input
                    id="edit-item-offered"
                    placeholder="Enter the item you're trading away"
                    value={editTrade.itemOffered}
                    onChange={(e) => setEditTrade(prev => ({ ...prev, itemOffered: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-item-requested">What you want (optional)</Label>
                  <Input
                    id="edit-item-requested"
                    placeholder="Enter what you're looking for"
                    value={editTrade.itemRequested}
                    onChange={(e) => setEditTrade(prev => ({ ...prev, itemRequested: e.target.value }))}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="edit-trade-description">Description (optional)</Label>
                  <Textarea
                    id="edit-trade-description"
                    placeholder="Add additional details about your trade..."
                    value={editTrade.description}
                    onChange={(e) => setEditTrade(prev => ({ ...prev, description: e.target.value }))}
                    className="min-h-[100px]"
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-2">
                  <Label>Images (optional - up to 5 images)</Label>
                  <div 
                    className="border-2 border-dashed border-gray-300 hover:border-blue-400 rounded-lg p-4 text-center transition-colors"
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.add('border-blue-500', 'bg-blue-50');
                    }}
                    onDragLeave={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.currentTarget.classList.remove('border-blue-500', 'bg-blue-50');
                      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
                      if (files.length > 0) {
                        const input = document.getElementById('edit-image-upload') as HTMLInputElement;
                        const dt = new DataTransfer();
                        files.forEach(file => dt.items.add(file));
                        input.files = dt.files;
                        handleEditImageSelect({ target: input } as React.ChangeEvent<HTMLInputElement>);
                      }
                    }}
                  >
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleEditImageSelect}
                      className="hidden"
                      id="edit-image-upload"
                      disabled={editSelectedImages.length >= 5}
                    />
                    <label
                      htmlFor="edit-image-upload"
                      className={`cursor-pointer flex flex-col items-center gap-2 ${
                        editSelectedImages.length >= 5 ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {editSelectedImages.length >= 5 
                          ? 'Maximum 5 images reached' 
                          : 'Click to upload images or drag and drop'
                        }
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG, GIF up to 5MB each • {editSelectedImages.length}/5 selected
                      </span>
                    </label>
                  </div>

                  {/* Image Previews */}
                  {editImagePreviewUrls.length > 0 && (
                    <div className="space-y-2 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {editImagePreviewUrls.length} image{editImagePreviewUrls.length !== 1 ? 's' : ''} selected
                        </span>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                        {editImagePreviewUrls.map((url, index) => (
                          <div key={index} className="relative group">
                            <div className="aspect-square border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
                              <ImageDisplay
                                src={url}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-full"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveEditImage(index)}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              title="Remove image"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                {error && (
                  <div className="text-red-500 text-sm">{error}</div>
                )}
                
                <div className="flex justify-end gap-3 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsEditDialogOpen(false)} 
                    disabled={editLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white" 
                    disabled={editLoading}
                  >
                    {editLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Trade'
                    )}
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
            <span>{filteredTrades.length} Trades Found</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Page {currentPage} of {totalPages}</span>
          </div>
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
          {loading && (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="ml-2">Loading trades...</span>
            </div>
          )}
          
          {error && (
            <div className="flex items-center justify-center py-12">
              <AlertCircle className="w-8 h-8 text-red-500 mr-2" />
              <span className="text-red-500">{error}</span>
            </div>
          )}
          
          {!loading && !error && (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredTrades.map((trade) => (
                <Card key={trade.trade_id} className="hover:shadow-lg transition-all duration-200 cursor-pointer group">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback>{trade.username?.[0] || 'U'}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{trade.username}</span>
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              {trade.credibility_score || 0}★
                            </Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            @{trade.roblox_username}
                          </div>
                        </div>
                      </div>
                      <Badge className={`${trade.status === 'open' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' : 
                        trade.status === 'in_progress' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' : 
                        trade.status === 'completed' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' : 
                        'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'}`}>
                        {trade.status}
                      </Badge>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Trade Images */}
                    {trade.images && trade.images.length > 0 && (
                      <div className="relative">
                        <ImageDisplay
                          src={`http://localhost:5000${trade.images[0].image_url}`}
                          alt={`${trade.item_offered} - Trade item`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        {trade.images.length > 1 && (
                          <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
                            <Upload className="w-3 h-3 inline mr-1" />
                            +{trade.images.length - 1} more
                          </div>
                        )}
                      </div>
                    )}

                    <div>
                      <h3 className="font-semibold mb-2 group-hover:text-blue-600 transition-colors">
                        Trading: {trade.item_offered}
                      </h3>
                      {trade.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {trade.description}
                        </p>
                      )}
                    </div>

                    {/* Trade Items */}
                    <div className="space-y-3">
                      <div>
                        <span className="text-xs text-muted-foreground mb-1 block">Offering:</span>
                        <Badge variant="outline" className="text-xs bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300">
                          {trade.item_offered}
                        </Badge>
                      </div>

                      {trade.item_requested && (
                        <>
                          <div className="flex items-center justify-center">
                            <ArrowRight className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div>
                            <span className="text-xs text-muted-foreground mb-1 block">Looking for:</span>
                            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300">
                              {trade.item_requested}
                            </Badge>
                          </div>
                        </>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className="pt-2 border-t border-border">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Posted: {new Date(trade.created_at).toLocaleDateString()}</span>
                        <span>ID: {trade.trade_id.slice(-6)}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                      {canEditTrade(trade) ? (
                        <>
                          <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => handleEditTrade(trade)}
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button size="sm" className="flex-1 bg-blue-500 hover:bg-blue-600 text-white">
                            <MessageSquare className="w-3 h-3 mr-1" />
                            Contact
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1">
                            View Details
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && !error && filteredTrades.length === 0 && (
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