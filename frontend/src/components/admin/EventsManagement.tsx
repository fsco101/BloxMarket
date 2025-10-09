import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { apiService } from '../../services/api';
import { toast } from 'sonner';

export function EventsManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadEvents = async () => {
    try {
      setLoading(true);
      const fetchedEvents = await apiService.getEvents();
      setEvents(fetchedEvents);
    } catch (err) {
      console.error('Error loading events:', err);
      setError(err instanceof Error ? err.message : 'Failed to load events');
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleDeleteEvent = async (eventId) => {
    try {
      await apiService.deleteEvent(eventId);
      toast.success('Event deleted successfully');
      loadEvents(); // Refresh the event list
    } catch (err) {
      console.error('Error deleting event:', err);
      toast.error('Failed to delete event');
    }
  };

  if (loading) {
    return <div>Loading events...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <Card>
        <CardHeader>
          <CardTitle>Events Management</CardTitle>
        </CardHeader>
        <CardContent>
          {events.length === 0 ? (
            <p>No events found.</p>
          ) : (
            <ul>
              {events.map(event => (
                <li key={event.id}>
                  <span>{event.name}</span>
                  <Button onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}