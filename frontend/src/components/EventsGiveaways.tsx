import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Progress } from './ui/progress';
import { 
  Gift, 
  Calendar, 
  Search, 
  Clock,
  Users,
  Trophy,
  Zap,
  Star,
  Heart,
  MessageSquare
} from 'lucide-react';

export function EventsGiveaways() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Mock events and giveaways data
  const events = [
    {
      id: 1,
      type: 'giveaway',
      title: '🎉 MEGA HOLIDAY GIVEAWAY - 250k Robux + Rare Items!',
      description: 'Celebrating the holidays with our biggest giveaway yet! Multiple winners, tons of prizes!',
      host: {
        username: 'BloxMarketOfficial',
        robloxUsername: 'BloxMarketOfficial',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        verified: true,
        official: true
      },
      prizes: ['250,000 Robux', 'Dominus Empyreus', 'Valkyrie Helm', '10x Limited Items'],
      entries: 3847,
      maxEntries: 5000,
      endDate: '2024-12-25T23:59:59Z',
      requirements: ['Follow on Roblox', 'Join Discord', 'Like & Share'],
      status: 'active',
      featured: true,
      entryMethod: 'social',
      winners: 15,
      timeLeft: '7 days 12 hours',
      image: 'https://images.unsplash.com/photo-1658856413378-288069d87d44?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYW1pbmclMjB0cmFkaW5nJTIwY2FyZHMlMjBkaWdpdGFsJTIwaXRlbXN8ZW58MXx8fHwxNzU4NTYwNDQ1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral'
    },
    {
      id: 2,
      type: 'competition',
      title: '🏆 Weekly Trading Competition - Best Profit Wins!',
      description: 'Show off your trading skills! Highest profit percentage wins amazing prizes. Screenshot proof required.',
      host: {
        username: 'TradingMaster',
        robloxUsername: 'TradingMaster',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        verified: true,
        rating: 5,
        vouchCount: 189
      },
      prizes: ['50,000 Robux', '25,000 Robux', '10,000 Robux'],
      participants: 156,
      maxParticipants: 200,
      endDate: '2024-12-22T23:59:59Z',
      requirements: ['Minimum 3 trades', 'Screenshot proof', 'No cross-trading'],
      status: 'active',
      entryMethod: 'skill',
      winners: 3,
      timeLeft: '4 days 8 hours'
    },
    {
      id: 3,
      type: 'giveaway',
      title: '✨ Quick Robux Giveaway - 25k Total!',
      description: 'Fast giveaway for active community members. Easy entry, quick results!',
      host: {
        username: 'GenerousTrader',
        robloxUsername: 'GenerousTrader',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 67
      },
      prizes: ['15,000 Robux', '7,500 Robux', '2,500 Robux'],
      entries: 892,
      maxEntries: 1000,
      endDate: '2024-12-20T18:00:00Z',
      requirements: ['Active in last 7 days', 'Comment below'],
      status: 'active',
      entryMethod: 'simple',
      winners: 3,
      timeLeft: '2 days 6 hours'
    },
    {
      id: 4,
      type: 'event',
      title: '🎊 New Year Trading Expo - Connect & Trade!',
      description: 'Join our virtual trading expo! Meet other traders, showcase your items, and make connections.',
      host: {
        username: 'EventCoordinator',
        robloxUsername: 'EventCoordinator',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        official: true,
        verified: true
      },
      participants: 234,
      maxParticipants: 500,
      endDate: '2024-12-31T20:00:00Z',
      requirements: ['RSVP required', 'Bring items to showcase'],
      status: 'upcoming',
      entryMethod: 'rsvp',
      timeLeft: '13 days'
    },
    {
      id: 5,
      type: 'giveaway',
      title: '🔥 Flash Giveaway - Pet Simulator Items!',
      description: 'Quick giveaway for Pet Simulator X players! Rare pets and exclusive items up for grabs.',
      host: {
        username: 'PetMaster',
        robloxUsername: 'PetMaster',
        avatar: 'https://images.unsplash.com/photo-1740252117027-4275d3f84385?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxyb2Jsb3glMjBhdmF0YXIlMjBjaGFyYWN0ZXJ8ZW58MXx8fHwxNzU4NTYwNDQ4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
        rating: 4,
        vouchCount: 124
      },
      prizes: ['Exclusive Pets', 'Huge Items', 'Gems & Diamonds'],
      entries: 445,
      maxEntries: 500,
      endDate: '2024-12-19T23:59:59Z',
      requirements: ['Play Pet Simulator X', 'React with 🔥'],
      status: 'ending-soon',
      entryMethod: 'game-specific',
      winners: 5,
      timeLeft: '18 hours'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'ending-soon': return 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300';
      case 'upcoming': return 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300';
      case 'ended': return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'giveaway': return <Gift className="w-5 h-5" />;
      case 'competition': return <Trophy className="w-5 h-5" />;
      case 'event': return <Calendar className="w-5 h-5" />;
      default: return <Gift className="w-5 h-5" />;
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || event.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Gift className="w-7 h-7 text-purple-500" />
              Events & Giveaways
            </h1>
            <p className="text-muted-foreground">Join exciting events and enter amazing giveaways</p>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Event Calendar
            </Button>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white">
              <Gift className="w-4 h-4 mr-2" />
              Host Event
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="border-b border-border p-4 bg-muted/30">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search events and giveaways..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Events</SelectItem>
              <SelectItem value="giveaway">Giveaways</SelectItem>
              <SelectItem value="competition">Competitions</SelectItem>
              <SelectItem value="event">Community Events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats */}
      <div className="bg-background p-4 border-b border-border">
        <div className="flex items-center justify-center gap-8 text-sm">
          <div className="flex items-center gap-2">
            <Gift className="w-4 h-4 text-green-500" />
            <span>{filteredEvents.filter(e => e.type === 'giveaway').length} Active Giveaways</span>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <span>{filteredEvents.filter(e => e.type === 'competition').length} Competitions</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-500" />
            <span>15,234 Total Participants</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredEvents.map((event) => (
              <Card key={event.id} className={`hover:shadow-lg transition-all duration-200 ${event.featured ? 'ring-2 ring-purple-500/20 bg-gradient-to-br from-purple-50/50 to-pink-50/50 dark:from-purple-950/50 dark:to-pink-950/50' : ''}`}>
                {event.featured && (
                  <div className="absolute -top-2 -right-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs px-3 py-1 rounded-full">
                    <Zap className="w-3 h-3 inline mr-1" />
                    FEATURED
                  </div>
                )}
                
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={event.host.avatar} />
                        <AvatarFallback>{event.host.username[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-sm">{event.host.username}</span>
                          {event.host.verified && (
                            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                              ✓
                            </Badge>
                          )}
                          {event.host.official && (
                            <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300">
                              OFFICIAL
                            </Badge>
                          )}
                        </div>
                        
                        {event.host.rating && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`w-2.5 h-2.5 ${i < event.host.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`} />
                              ))}
                            </div>
                            <span>({event.host.vouchCount})</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(event.status)}>
                        {event.status.replace('-', ' ')}
                      </Badge>
                      <Badge variant="outline" className="capitalize">
                        {getTypeIcon(event.type)}
                        <span className="ml-1">{event.type}</span>
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {event.image && (
                    <div className="rounded-lg overflow-hidden">
                      <img 
                        src={event.image} 
                        alt="Event"
                        className="w-full h-32 object-cover"
                      />
                    </div>
                  )}
                  
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>

                  {/* Prizes */}
                  {event.prizes && (
                    <div>
                      <span className="text-sm text-muted-foreground mb-2 block">Prizes:</span>
                      <div className="flex flex-wrap gap-1">
                        {event.prizes.slice(0, 3).map((prize, i) => (
                          <Badge key={i} className="bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                            {prize}
                          </Badge>
                        ))}
                        {event.prizes.length > 3 && (
                          <Badge variant="outline">+{event.prizes.length - 3} more</Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Progress Bar */}
                  {event.entries !== undefined && event.maxEntries && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Entries: {event.entries.toLocaleString()}</span>
                        <span>{event.maxEntries.toLocaleString()} max</span>
                      </div>
                      <Progress value={(event.entries / event.maxEntries) * 100} className="h-2" />
                    </div>
                  )}

                  {event.participants !== undefined && event.maxParticipants && (
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Participants: {event.participants}</span>
                        <span>{event.maxParticipants} max</span>
                      </div>
                      <Progress value={(event.participants / event.maxParticipants) * 100} className="h-2" />
                    </div>
                  )}

                  {/* Requirements */}
                  <div>
                    <span className="text-sm text-muted-foreground mb-2 block">Requirements:</span>
                    <div className="flex flex-wrap gap-1">
                      {event.requirements.map((req, i) => (
                        <Badge key={i} variant="outline" className="text-xs">
                          {req}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Time and Stats */}
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span>{event.timeLeft}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Trophy className="w-4 h-4 text-yellow-500" />
                        <span>{event.winners} winners</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button size="sm" className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white">
                      {event.type === 'giveaway' ? 'Enter Giveaway' : event.type === 'competition' ? 'Join Competition' : 'RSVP'}
                    </Button>
                    <Button variant="outline" size="sm">
                      <Heart className="w-3 h-3 mr-1" />
                      Save
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageSquare className="w-3 h-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredEvents.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <div className="text-muted-foreground">
                  <Gift className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">No events found</h3>
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