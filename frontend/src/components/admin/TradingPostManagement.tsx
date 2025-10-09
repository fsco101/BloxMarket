import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { 
  ShoppingCart, 
  Search, 
  Eye, 
  Trash2, 
  Flag, 
  DollarSign,
  Package,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  TrendingUp,
  Archive
} from 'lucide-react';

interface TradingPost {
  _id: string;
  title: string;
  description: string;
  author: {
    _id: string;
    username: string;
    avatar_url?: string;
    role: string;
  };
  type: 'sell' | 'buy' | 'trade';
  item_name: string;
  price?: number;
  currency?: string;
  images?: string[];
  status: 'active' | 'completed' | 'archived' | 'flagged' | 'deleted';
  createdAt: string;
  updatedAt?: string;
  views: number;
  interested_users: number;
  flagCount: number;
  isFlagged: boolean;
  expiresAt?: string;
}

export function TradingPostManagement() {
  const [posts, setPosts] = useState<TradingPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedPost, setSelectedPost] = useState<TradingPost | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadTradingPosts = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTradingPosts({
        page,
        limit: 20,
        search: searchTerm,
        type: typeFilter === 'all' ? '' : typeFilter,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      
      setPosts(response.posts || []);
      setTotalPages(response.totalPages || 1);
    } catch (error) {
      console.error('Error loading trading posts:', error);
      toast.error('Failed to load trading posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedLoad = setTimeout(() => {
      loadTradingPosts();
    }, 300);

    return () => clearTimeout(delayedLoad);
  }, [searchTerm, typeFilter, statusFilter, page]);

  const handlePostAction = async (postId: string, action: string, data?: any) => {
    try {
      setActionLoading(postId);
      await apiService.moderateTradingPost(postId, action, data);
      toast.success(`Trading post ${action}ed successfully`);
      loadTradingPosts();
    } catch (error) {
      console.error(`Error ${action}ing trading post:`, error);
      toast.error(`Failed to ${action} trading post`);
    } finally {
      setActionLoading(null);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'sell': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'buy': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'trade': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'archived': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      case 'flagged': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'deleted': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.author.username.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === 'all' || post.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || post.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Trading Post Management</h2>
          <p className="text-muted-foreground">Moderate trading posts and marketplace listings</p>
        </div>
        <Button onClick={loadTradingPosts} variant="outline">
          <ShoppingCart className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <ShoppingCart className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Posts</p>
                <p className="text-2xl font-bold">{posts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Active Posts</p>
                <p className="text-2xl font-bold">{posts.filter(p => p.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
                <Flag className="w-5 h-5 text-red-600 dark:text-red-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Flagged Posts</p>
                <p className="text-2xl font-bold text-red-600">{posts.filter(p => p.isFlagged).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Value</p>
                <p className="text-2xl font-bold">
                  ${posts.reduce((sum, p) => sum + (p.price || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, item name, or author..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="sell">Sell</SelectItem>
                <SelectItem value="buy">Buy</SelectItem>
                <SelectItem value="trade">Trade</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
                <SelectItem value="flagged">Flagged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Trading Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trading Posts ({filteredPosts.length})</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading trading posts...</p>
            </div>
          ) : filteredPosts.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">Post</th>
                    <th className="p-4 font-medium">Author</th>
                    <th className="p-4 font-medium">Type</th>
                    <th className="p-4 font-medium">Price</th>
                    <th className="p-4 font-medium">Stats</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPosts.map((post) => (
                    <tr key={post._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-start gap-3">
                          {post.isFlagged && <Flag className="w-4 h-4 text-red-500 mt-1" />}
                          <div className="flex-1">
                            <h3 className="font-medium line-clamp-1">{post.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {post.item_name}
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {new Date(post.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Avatar className="w-8 h-8">
                            <AvatarImage src={post.author.avatar_url} />
                            <AvatarFallback>{post.author.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium text-sm">{post.author.username}</p>
                            <p className="text-xs text-muted-foreground">{post.author.role}</p>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={getTypeColor(post.type)}>
                          {post.type.toUpperCase()}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        {post.price ? (
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-medium">{post.price.toLocaleString()}</span>
                            {post.currency && <span className="text-xs text-muted-foreground">{post.currency}</span>}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{post.views}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="w-3 h-3" />
                            <span>{post.interested_users}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="space-y-1">
                          <Badge className={getStatusColor(post.status)}>
                            {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                          </Badge>
                          {post.isFlagged && (
                            <Badge variant="destructive" className="text-xs">
                              {post.flagCount} flags
                            </Badge>
                          )}
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedPost(post);
                              setIsViewDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePostAction(post._id, 'archive')}
                            disabled={actionLoading === post._id}
                          >
                            {actionLoading === post._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Archive className="w-4 h-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handlePostAction(post._id, 'delete')}
                            disabled={actionLoading === post._id}
                          >
                            {actionLoading === post._id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trading posts found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Post Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Trading Post Details</DialogTitle>
            <DialogDescription>
              View and moderate trading post
            </DialogDescription>
          </DialogHeader>
          
          {selectedPost && (
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">{selectedPost.title}</h2>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={selectedPost.author.avatar_url} />
                        <AvatarFallback>{selectedPost.author.username[0]?.toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{selectedPost.author.username}</p>
                        <p className="text-sm text-muted-foreground">{selectedPost.author.role}</p>
                      </div>
                    </div>
                    <Badge className={getTypeColor(selectedPost.type)}>
                      {selectedPost.type.toUpperCase()}
                    </Badge>
                    <Badge className={getStatusColor(selectedPost.status)}>
                      {selectedPost.status}
                    </Badge>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3">Item Details</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Item Name</label>
                      <p>{selectedPost.item_name}</p>
                    </div>
                    {selectedPost.price && (
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Price</label>
                        <p className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {selectedPost.price.toLocaleString()}
                          {selectedPost.currency && <span className="text-muted-foreground">({selectedPost.currency})</span>}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-3">Statistics</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Views</span>
                      <span className="font-medium">{selectedPost.views}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Interested Users</span>
                      <span className="font-medium">{selectedPost.interested_users}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Flags</span>
                      <span className="font-medium">{selectedPost.flagCount}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Description</h4>
                <div className="whitespace-pre-wrap text-sm leading-relaxed bg-muted p-4 rounded-lg">
                  {selectedPost.description}
                </div>
              </div>
              
              {selectedPost.images && selectedPost.images.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3">Images</h4>
                  <div className="grid grid-cols-3 gap-4">
                    {selectedPost.images.map((image, i) => (
                      <img
                        key={i}
                        src={image}
                        alt={`Trading post image ${i + 1}`}
                        className="w-full h-32 object-cover rounded-lg border"
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}