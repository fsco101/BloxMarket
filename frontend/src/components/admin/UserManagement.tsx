import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { 
  Search, 
  Filter, 
  Ban, 
  UserCheck, 
  Edit, 
  Eye, 
  MoreHorizontal,
  Shield,
  Crown,
  User,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2
} from 'lucide-react';

interface User {
  _id: string;
  username: string;
  email: string;
  roblox_username: string;
  role: string;
  avatar_url?: string;
  credibility_score: number;
  createdAt: string;
  lastActive?: string;
  totalTrades: number;
  totalVouches: number;
  isActive: boolean;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({
        page,
        limit: 20,
        search: searchTerm,
        role: roleFilter === 'all' ? '' : roleFilter,
        status: statusFilter === 'all' ? '' : statusFilter
      });
      
      setUsers(response.users);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayedLoad = setTimeout(() => {
      loadUsers();
    }, 300);

    return () => clearTimeout(delayedLoad);
  }, [searchTerm, roleFilter, statusFilter, page]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      await apiService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setActionLoading(null);
    }
  };

  const handleBanUser = async (userId: string, action: 'ban' | 'unban', reason?: string) => {
    try {
      setActionLoading(userId);
      await apiService.banUser(userId, action, reason);
      toast.success(`User ${action}ned successfully`);
      loadUsers();
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'admin': return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'moderator': return <Shield className="w-4 h-4 text-blue-500" />;
      case 'middleman': return <UserCheck className="w-4 h-4 text-green-500" />;
      case 'verified': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case 'banned': return <Ban className="w-4 h-4 text-red-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'moderator': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'middleman': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'verified': return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200';
      case 'banned': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.roblox_username && user.roblox_username.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === 'all' || user.role === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && user.isActive) ||
                         (statusFilter === 'inactive' && !user.isActive);
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 flex-1 min-w-64">
              <Search className="w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search users by username, email, or Roblox username..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
            </div>
            
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="middleman">Middleman</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="banned">Banned</SelectItem>
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Users ({filteredUsers.length})</span>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b">
                  <tr className="text-left">
                    <th className="p-4 font-medium">User</th>
                    <th className="p-4 font-medium">Role</th>
                    <th className="p-4 font-medium">Stats</th>
                    <th className="p-4 font-medium">Status</th>
                    <th className="p-4 font-medium">Joined</th>
                    <th className="p-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user) => (
                    <tr key={user._id} className="border-b hover:bg-muted/50">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={user.avatar_url} />
                            <AvatarFallback>{user.username[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                            {user.roblox_username && (
                              <p className="text-xs text-blue-600">@{user.roblox_username}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge className={`${getRoleColor(user.role)} flex items-center gap-1 w-fit`}>
                          {getRoleIcon(user.role)}
                          {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <div className="text-sm">
                          <p>{user.totalTrades} trades</p>
                          <p>{user.totalVouches} vouches</p>
                          <p className="text-xs text-muted-foreground">
                            {user.credibility_score}% credibility
                          </p>
                        </div>
                      </td>
                      
                      <td className="p-4">
                        <Badge variant={user.isActive ? "default" : "secondary"}>
                          {user.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      
                      <td className="p-4">
                        <p className="text-sm">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </p>
                        {user.lastActive && (
                          <p className="text-xs text-muted-foreground">
                            Last: {new Date(user.lastActive).toLocaleDateString()}
                          </p>
                        )}
                      </td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Select
                            value={user.role}
                            onValueChange={(newRole) => handleRoleChange(user._id, newRole)}
                            disabled={actionLoading === user._id}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="verified">Verified</SelectItem>
                              <SelectItem value="middleman">Middleman</SelectItem>
                              <SelectItem value="moderator">Moderator</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          {user.role !== 'banned' ? (
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanUser(user._id, 'ban', 'Banned by admin')}
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Ban className="w-4 h-4" />
                              )}
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleBanUser(user._id, 'unban')}
                              disabled={actionLoading === user._id}
                            >
                              {actionLoading === user._id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <CheckCircle className="w-4 h-4" />
                              )}
                            </Button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedUser(user);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Eye className="w-4 h-4" />
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
              <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No users found matching your criteria</p>
            </div>
          )}
        </CardContent>
      </Card>

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

      {/* User Details Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>
              View detailed information about this user
            </DialogDescription>
          </DialogHeader>
          
          {selectedUser && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedUser.avatar_url} />
                  <AvatarFallback className="text-xl">
                    {selectedUser.username[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{selectedUser.username}</h3>
                  <p className="text-muted-foreground">{selectedUser.email}</p>
                  {selectedUser.roblox_username && (
                    <p className="text-blue-600">@{selectedUser.roblox_username}</p>
                  )}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Role</label>
                  <div className="mt-1">
                    <Badge className={`${getRoleColor(selectedUser.role)} flex items-center gap-1 w-fit`}>
                      {getRoleIcon(selectedUser.role)}
                      {selectedUser.role.charAt(0).toUpperCase() + selectedUser.role.slice(1)}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Status</label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.isActive ? "default" : "secondary"}>
                      {selectedUser.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Trades</label>
                  <p className="text-lg font-semibold">{selectedUser.totalTrades}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Vouches</label>
                  <p className="text-lg font-semibold">{selectedUser.totalVouches}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Credibility Score</label>
                  <p className="text-lg font-semibold">{selectedUser.credibility_score}%</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Member Since</label>
                  <p className="text-lg font-semibold">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}