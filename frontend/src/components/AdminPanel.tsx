import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Shield, 
  Users, 
  Flag, 
  Settings,
  Search,
  Ban,
  CheckCircle,
  XCircle,
  AlertTriangle,
  TrendingUp,
  MessageSquare,
  Eye,
  Trash2
} from 'lucide-react';

export function AdminPanel() {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');

  // Mock admin data
  const adminStats = {
    totalUsers: 15847,
    activeUsers: 2341,
    flaggedPosts: 23,
    pendingReports: 15,
    bannedUsers: 89,
    verificationRequests: 12
  };

  const flaggedPosts = [
    {
      id: 1,
      title: 'Suspicious Trading Offer - Check This Out',
      author: 'SuspiciousUser123',
      content: 'Offering items way below market value, might be scam...',
      reports: 5,
      reason: 'Potential Scam',
      timestamp: '2 hours ago',
      status: 'pending',
      severity: 'high'
    },
    {
      id: 2,
      title: 'Inappropriate Content in Trading Post',
      author: 'BadBehavior99',
      content: 'Post contains inappropriate language and harassment...',
      reports: 3,
      reason: 'Inappropriate Content',
      timestamp: '4 hours ago',
      status: 'pending',
      severity: 'medium'
    },
    {
      id: 3,
      title: 'Fake Middleman Service Advertisement',
      author: 'FakeMMService',
      content: 'Claiming to be verified middleman without proper credentials...',
      reports: 8,
      reason: 'Impersonation',
      timestamp: '6 hours ago',
      status: 'pending',
      severity: 'high'
    }
  ];

  const userReports = [
    {
      id: 1,
      reportedUser: 'ScammerAlert',
      reportedBy: 'VictimUser',
      reason: 'Attempted to scam me out of my limited items',
      type: 'Scamming',
      timestamp: '1 hour ago',
      status: 'pending',
      evidence: ['Screenshots', 'Chat logs']
    },
    {
      id: 2,
      reportedUser: 'RudeTrader',
      reportedBy: 'PoliteTradingUser',
      reason: 'Very rude and threatening behavior during trade negotiation',
      type: 'Harassment',
      timestamp: '3 hours ago',
      status: 'pending',
      evidence: ['Chat logs']
    }
  ];

  const verificationRequests = [
    {
      id: 1,
      username: 'TrustedMM_New',
      robloxUsername: 'TrustedMM_New',
      type: 'Middleman',
      joinDate: '2024-01-15',
      trades: 156,
      vouches: 89,
      documents: ['ID Verification', 'Trade History'],
      status: 'pending'
    },
    {
      id: 2,
      username: 'ExpertTrader2024',
      robloxUsername: 'ExpertTrader2024',
      type: 'Verified Trader',
      joinDate: '2023-08-22',
      trades: 234,
      vouches: 167,
      documents: ['Trade History', 'References'],
      status: 'pending'
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300';
      case 'rejected': return 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300';
      case 'pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="flex-1 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="w-7 h-7 text-red-500" />
              Admin Panel
            </h1>
            <p className="text-muted-foreground">Manage users, moderate content, and oversee platform security</p>
          </div>
          
          <Alert className="w-auto border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
            <AlertTriangle className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-700 dark:text-orange-300">
              {adminStats.pendingReports} pending reports require attention
            </AlertDescription>
          </Alert>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="flagged-posts">Flagged Posts</TabsTrigger>
              <TabsTrigger value="user-reports">User Reports</TabsTrigger>
              <TabsTrigger value="verification">Verification</TabsTrigger>
              <TabsTrigger value="system">System</TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total Users</p>
                        <p className="text-2xl font-bold">{adminStats.totalUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Active Users</p>
                        <p className="text-2xl font-bold">{adminStats.activeUsers.toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Flag className="w-5 h-5 text-orange-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Flagged Posts</p>
                        <p className="text-2xl font-bold">{adminStats.flaggedPosts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Pending Reports</p>
                        <p className="text-2xl font-bold">{adminStats.pendingReports}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <Ban className="w-5 h-5 text-red-600" />
                      <div>
                        <p className="text-sm text-muted-foreground">Banned Users</p>
                        <p className="text-2xl font-bold">{adminStats.bannedUsers}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-purple-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Verification Queue</p>
                        <p className="text-2xl font-bold">{adminStats.verificationRequests}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Flag className="w-5 h-5" />
                      Recent Flagged Content
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {flaggedPosts.slice(0, 3).map((post) => (
                        <div key={post.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{post.title}</span>
                            <Badge className={getSeverityColor(post.severity)}>
                              {post.severity}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">by @{post.author} • {post.reports} reports</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Recent User Reports
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {userReports.slice(0, 3).map((report) => (
                        <div key={report.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">@{report.reportedUser}</span>
                            <Badge variant="outline">{report.type}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">Reported by @{report.reportedBy}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="flagged-posts" className="space-y-4">
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-2 flex-1">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search flagged posts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
                <Select defaultValue="all">
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="high">High Severity</SelectItem>
                    <SelectItem value="medium">Medium Severity</SelectItem>
                    <SelectItem value="low">Low Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {flaggedPosts.map((post) => (
                <Card key={post.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{post.title}</h3>
                          <Badge className={getSeverityColor(post.severity)}>
                            {post.severity} severity
                          </Badge>
                          <Badge variant="outline">{post.reason}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{post.content}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>By @{post.author}</span>
                          <span>• {post.reports} reports</span>
                          <span>• {post.timestamp}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Remove
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="user-reports" className="space-y-4">
              {userReports.map((report) => (
                <Card key={report.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">@{report.reportedUser}</h3>
                          <Badge variant="outline">{report.type}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">{report.reason}</p>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <span>Reported by @{report.reportedBy}</span>
                          <span>• {report.timestamp}</span>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">Evidence:</span>
                          {report.evidence.map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {item}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <MessageSquare className="w-4 h-4 mr-1" />
                          Contact
                        </Button>
                        <Button size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-white">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          Warn
                        </Button>
                        <Button size="sm" variant="destructive">
                          <Ban className="w-4 h-4 mr-1" />
                          Ban
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="verification" className="space-y-4">
              {verificationRequests.map((request) => (
                <Card key={request.id}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarFallback>{request.username[0]}</AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold">{request.username}</h3>
                            <Badge variant="outline">{request.type}</Badge>
                          </div>
                          
                          <p className="text-sm text-muted-foreground mb-3">@{request.robloxUsername}</p>
                          
                          <div className="grid grid-cols-3 gap-4 text-sm mb-3">
                            <div>
                              <span className="text-muted-foreground">Joined:</span>
                              <p className="font-medium">{new Date(request.joinDate).toLocaleDateString()}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Trades:</span>
                              <p className="font-medium">{request.trades}</p>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Vouches:</span>
                              <p className="font-medium">{request.vouches}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Documents:</span>
                            {request.documents.map((doc, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                        <Button size="sm" className="bg-green-500 hover:bg-green-600 text-white">
                          <CheckCircle className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button size="sm" variant="destructive">
                          <XCircle className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5" />
                      System Settings
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        Configure Auto-Moderation
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Manage User Roles
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Update Community Rules
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="w-5 h-5" />
                      Security
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        View Security Logs
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Manage IP Bans
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Security Reports
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trash2 className="w-5 h-5" />
                      Maintenance
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <Button variant="outline" className="w-full justify-start">
                        Clean Up Old Data
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        Database Maintenance
                      </Button>
                      <Button variant="outline" className="w-full justify-start">
                        System Backup
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}