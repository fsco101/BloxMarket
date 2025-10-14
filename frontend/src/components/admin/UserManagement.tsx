import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { apiService } from '../../services/api';
import { toast } from 'sonner';
import { 
  Search, 
  Ban, 
  UserCheck, 
  Eye, 
  Shield,
  Crown,
  User,
  AlertTriangle,
  CheckCircle,
  Loader2,
  UserX,
  UserPlus
} from 'lucide-react';

// Add jQuery and DataTables CSS/JS to your index.html
// <link rel="stylesheet" href="https://cdn.datatables.net/1.13.6/css/dataTables.bootstrap5.min.css">
// <script src="https://code.jquery.com/jquery-3.7.0.min.js"></script>
// <script src="https://cdn.datatables.net/1.13.6/js/jquery.dataTables.min.js"></script>
// <script src="https://cdn.datatables.net/1.13.6/js/dataTables.bootstrap5.min.js"></script>

declare global {
  interface Window {
    $: any;
    jQuery: any;
  }
}

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
  is_active?: boolean; // Add this to handle backend format
  ban_reason?: string;
  banned_at?: string;
  deactivation_reason?: string;
  deactivated_at?: string;
}

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  
  // Action dialogs
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [actionUser, setActionUser] = useState<User | null>(null);
  const [actionReason, setActionReason] = useState('');

  const tableRef = useRef<HTMLTableElement>(null);
  const dataTableRef = useRef<any>(null);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getUsers({
        page: 1,
        limit: 1000,
        search: '',
        role: '',
        status: ''
      });
      
      console.log('Loaded users:', response.users);
      
      // Normalize the user data to handle both camelCase and snake_case
      const normalizedUsers = response.users.map((user: any) => ({
        ...user,
        isActive: user.isActive !== undefined ? user.isActive : user.is_active
      }));
      
      setUsers(normalizedUsers);
      
      // Initialize or reload DataTable
      if (dataTableRef.current) {
        dataTableRef.current.clear();
        dataTableRef.current.rows.add(normalizedUsers);
        dataTableRef.current.draw();
      } else {
        initializeDataTable(normalizedUsers);
      }
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const initializeDataTable = (userData: User[]) => {
    if (!window.$ || !tableRef.current) return;

    const $ = window.$;
    
    dataTableRef.current = $(tableRef.current).DataTable({
      data: userData,
      responsive: true,
      pageLength: 25,
      order: [[5, 'desc']], // Order by creation date
      columns: [
        {
          title: 'User',
          data: null,
          orderable: false,
          render: (data: User) => {
            return `
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  ${data.avatar_url ? 
                    `<img src="${data.avatar_url}" alt="${data.username}" class="w-10 h-10 rounded-full object-cover" />` :
                    `<span class="font-medium text-sm">${data.username[0]?.toUpperCase()}</span>`
                  }
                </div>
                <div>
                  <p class="font-medium">${data.username}</p>
                  <p class="text-sm text-gray-500">${data.email}</p>
                  ${data.roblox_username ? `<p class="text-xs text-blue-600">@${data.roblox_username}</p>` : ''}
                </div>
              </div>
            `;
          }
        },
        {
          title: 'Role',
          data: 'role',
          render: (data: string) => {
            const getRoleClass = (role: string) => {
              switch (role) {
                case 'admin': return 'bg-yellow-100 text-yellow-800';
                case 'moderator': return 'bg-blue-100 text-blue-800';
                case 'middleman': return 'bg-green-100 text-green-800';
                case 'verified': return 'bg-indigo-100 text-indigo-800';
                case 'banned': return 'bg-red-100 text-red-800';
                default: return 'bg-gray-100 text-gray-800';
              }
            };
            
            return `<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleClass(data)}">
              ${data.charAt(0).toUpperCase() + data.slice(1)}
            </span>`;
          }
        },
        {
          title: 'Stats',
          data: null,
          orderable: false,
          render: (data: User) => {
            return `
              <div class="text-sm">
                <p>${data.totalTrades} trades</p>
                <p>${data.totalVouches} vouches</p>
                <p class="text-xs text-gray-500">${data.credibility_score}% credibility</p>
              </div>
            `;
          }
        },
        {
          title: 'Status',
          data: 'isActive',
          render: (data: boolean, type: string, row: User) => {
            let statusBadge = '';
            if (row.role === 'banned') {
              statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Banned</span>';
            } else if (data) {
              statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>';
            } else {
              statusBadge = '<span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>';
            }
            
            let reasonText = '';
            if (row.ban_reason) {
              reasonText = `<p class="text-xs text-red-600 mt-1">Banned: ${row.ban_reason}</p>`;
            } else if (row.deactivation_reason) {
              reasonText = `<p class="text-xs text-orange-600 mt-1">Deactivated: ${row.deactivation_reason}</p>`;
            }
            
            return `<div>${statusBadge}${reasonText}</div>`;
          }
        },
        {
          title: 'Joined',
          data: 'createdAt',
          render: (data: string, type: string, row: User) => {
            const joinDate = new Date(data).toLocaleDateString();
            const lastActive = row.lastActive ? new Date(row.lastActive).toLocaleDateString() : '';
            
            return `
              <div>
                <p class="text-sm">${joinDate}</p>
                ${lastActive ? `<p class="text-xs text-gray-500">Last: ${lastActive}</p>` : ''}
              </div>
            `;
          }
        },
        {
          title: 'Actions',
          data: null,
          orderable: false,
          render: (data: User) => {
            const isLoading = actionLoading === data._id;
            const isBanned = data.role === 'banned';
            
            return `
              <div class="flex items-center gap-2">
                <select class="role-select form-select form-select-sm" data-user-id="${data._id}" ${isLoading || isBanned ? 'disabled' : ''}>
                  <option value="user" ${data.role === 'user' ? 'selected' : ''}>User</option>
                  <option value="verified" ${data.role === 'verified' ? 'selected' : ''}>Verified</option>
                  <option value="middleman" ${data.role === 'middleman' ? 'selected' : ''}>Middleman</option>
                  <option value="moderator" ${data.role === 'moderator' ? 'selected' : ''}>Moderator</option>
                  <option value="admin" ${data.role === 'admin' ? 'selected' : ''}>Admin</option>
                </select>
                
                ${!isBanned ? `
                  <button class="btn btn-sm btn-outline-danger ban-btn" data-user-id="${data._id}" ${isLoading ? 'disabled' : ''}>
                    ${isLoading ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-ban"></i>'}
                  </button>
                ` : `
                  <button class="btn btn-sm btn-outline-success unban-btn" data-user-id="${data._id}" ${isLoading ? 'disabled' : ''}>
                    ${isLoading ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-check-circle"></i>'}
                  </button>
                `}
                
                ${!isBanned ? (data.isActive ? `
                  <button class="btn btn-sm btn-outline-warning deactivate-btn" data-user-id="${data._id}" ${isLoading ? 'disabled' : ''}>
                    ${isLoading ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-user-times"></i>'}
                  </button>
                ` : `
                  <button class="btn btn-sm btn-outline-success activate-btn" data-user-id="${data._id}" ${isLoading ? 'disabled' : ''}>
                    ${isLoading ? '<i class="fas fa-spinner fa-spin"></i>' : '<i class="fas fa-user-plus"></i>'}
                  </button>
                `) : ''}
                
                <button class="btn btn-sm btn-outline-primary view-btn" data-user-id="${data._id}">
                  <i class="fas fa-eye"></i>
                </button>
              </div>
            `;
          }
        }
      ],
      dom: 'Bfrtip',
      buttons: [
        'copy', 'csv', 'excel', 'pdf', 'print'
      ],
      language: {
        search: "Search users:",
        lengthMenu: "Show _MENU_ users per page",
        info: "Showing _START_ to _END_ of _TOTAL_ users",
        infoEmpty: "No users found",
        infoFiltered: "(filtered from _MAX_ total users)"
      }
    });

    // Event handlers
    $(tableRef.current).on('change', '.role-select', (e: any) => {
      const userId = $(e.target).data('user-id');
      const newRole = $(e.target).val();
      handleRoleChange(userId, newRole);
    });

    $(tableRef.current).on('click', '.ban-btn', (e: any) => {
      const userId = $(e.target).closest('button').data('user-id');
      const user = users.find(u => u._id === userId);
      if (user) openBanDialog(user);
    });

    $(tableRef.current).on('click', '.unban-btn', (e: any) => {
      const userId = $(e.target).closest('button').data('user-id');
      handleBanUser(userId, 'unban');
    });

    $(tableRef.current).on('click', '.deactivate-btn', (e: any) => {
      const userId = $(e.target).closest('button').data('user-id');
      const user = users.find(u => u._id === userId);
      if (user) openDeactivateDialog(user);
    });

    $(tableRef.current).on('click', '.activate-btn', (e: any) => {
      const userId = $(e.target).closest('button').data('user-id');
      handleStatusChange(userId, 'activate');
    });

    $(tableRef.current).on('click', '.view-btn', (e: any) => {
      const userId = $(e.target).closest('button').data('user-id');
      const user = users.find(u => u._id === userId);
      if (user) {
        setSelectedUser(user);
        setIsEditDialogOpen(true);
      }
    });
  };

  useEffect(() => {
    loadUsers();
    
    // Cleanup DataTable on unmount
    return () => {
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      setActionLoading(userId);
      await apiService.updateUserRole(userId, newRole);
      toast.success('User role updated successfully');
      loadUsers();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
      loadUsers(); // Reload to reset the select
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
      setBanDialogOpen(false);
      setActionReason('');
    } catch (error) {
      console.error(`Error ${action}ning user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleStatusChange = async (userId: string, action: 'activate' | 'deactivate', reason?: string) => {
    try {
      setActionLoading(userId);
      await apiService.updateUserStatus(userId, action, reason);
      toast.success(`User ${action}d successfully`);
      loadUsers();
      setDeactivateDialogOpen(false);
      setActionReason('');
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      toast.error(`Failed to ${action} user`);
    } finally {
      setActionLoading(null);
    }
  };

  const openBanDialog = (user: User) => {
    setActionUser(user);
    setBanDialogOpen(true);
    setActionReason('');
  };

  const openDeactivateDialog = (user: User) => {
    setActionUser(user);
    setDeactivateDialogOpen(true);
    setActionReason('');
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">User Management</h2>
          <p className="text-muted-foreground">Manage user accounts, roles, and permissions</p>
        </div>
        <Button onClick={loadUsers} disabled={loading}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
          Refresh
        </Button>
      </div>

      {/* DataTable */}
      <Card>
        <CardHeader>
          <CardTitle>Users ({users.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
              <p className="text-muted-foreground">Loading users...</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table 
                ref={tableRef}
                className="table table-striped table-hover"
                style={{ width: '100%' }}
              >
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Stats</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Data will be populated by DataTables */}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ban Dialog */}
      <Dialog open={banDialogOpen} onOpenChange={setBanDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ban User</DialogTitle>
            <DialogDescription>
              Please provide a reason for banning {actionUser?.username}. This action will immediately prevent the user from accessing the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter ban reason..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setBanDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => actionUser && handleBanUser(actionUser._id, 'ban', actionReason)}
                disabled={!actionReason.trim() || actionLoading === actionUser?._id}
              >
                {actionLoading === actionUser?._id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Ban User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deactivate Dialog */}
      <Dialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deactivate User</DialogTitle>
            <DialogDescription>
              Please provide a reason for deactivating {actionUser?.username}. The user will be unable to access the platform until reactivated.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Enter deactivation reason..."
              value={actionReason}
              onChange={(e) => setActionReason(e.target.value)}
              rows={3}
            />
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDeactivateDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="secondary"
                onClick={() => actionUser && handleStatusChange(actionUser._id, 'deactivate', actionReason)}
                disabled={!actionReason.trim() || actionLoading === actionUser?._id}
              >
                {actionLoading === actionUser?._id ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Deactivate User
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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

              {/* Ban/Deactivation Information */}
              {(selectedUser.ban_reason || selectedUser.deactivation_reason) && (
                <div className="space-y-4 border-t pt-4">
                  {selectedUser.ban_reason && (
                    <div>
                      <label className="text-sm font-medium text-red-600">Ban Reason</label>
                      <p className="text-sm bg-red-50 dark:bg-red-950 p-2 rounded border">
                        {selectedUser.ban_reason}
                      </p>
                      {selectedUser.banned_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Banned on: {new Date(selectedUser.banned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {selectedUser.deactivation_reason && (
                    <div>
                      <label className="text-sm font-medium text-orange-600">Deactivation Reason</label>
                      <p className="text-sm bg-orange-50 dark:bg-orange-950 p-2 rounded border">
                        {selectedUser.deactivation_reason}
                      </p>
                      {selectedUser.deactivated_at && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Deactivated on: {new Date(selectedUser.deactivated_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}