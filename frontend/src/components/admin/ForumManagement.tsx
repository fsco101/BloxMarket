import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { Loader2, AlertTriangle } from 'lucide-react';

interface ForumPost {
  id: number;
  title: string;
  content: string;
  author: string;
  createdAt: string;
}

export function ForumManagement() {
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPosts = async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedPosts = await apiService.getForumPosts();
      setPosts(fetchedPosts);
    } catch (err: unknown) {
      console.error('Error loading forum posts:', err);
      setError(err instanceof Error ? err.message : 'Failed to load forum posts');
      toast.error('Failed to load forum posts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeletePost = async (postId: number) => {
    try {
      await apiService.deleteForumPost(postId);
      setPosts(posts.filter(post => post.id !== postId));
      toast.success('Post deleted successfully');
    } catch (err: unknown) {
      console.error('Error deleting post:', err);
      toast.error('Failed to delete post');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
        <p className="text-muted-foreground">Loading forum posts...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-4" />
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={loadPosts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Forum Management</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.map(post => (
            <div key={post.id} className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold">{post.title}</h3>
                <p>{post.content}</p>
                <p className="text-sm text-muted-foreground">By {post.author} on {new Date(post.createdAt).toLocaleDateString()}</p>
              </div>
              <Button variant="destructive" onClick={() => handleDeletePost(post.id)}>Delete</Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}