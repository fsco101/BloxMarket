import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

export function WishlistManagement() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadWishlists = async () => {
    try {
      setLoading(true);
      const response = await apiService.getWishlists();
      setWishlists(response);
    } catch (err) {
      console.error('Error loading wishlists:', err);
      setError('Failed to load wishlists');
      toast.error('Failed to load wishlists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWishlists();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Wishlist Management</CardTitle>
        </CardHeader>
        <CardContent>
          {wishlists.length === 0 ? (
            <p>No wishlists available.</p>
          ) : (
            <ul>
              {wishlists.map((wishlist) => (
                <li key={wishlist.id}>
                  <h3>{wishlist.title}</h3>
                  <p>{wishlist.description}</p>
                  <Button onClick={() => {/* Handle edit */}}>Edit</Button>
                  <Button onClick={() => {/* Handle delete */}}>Delete</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}