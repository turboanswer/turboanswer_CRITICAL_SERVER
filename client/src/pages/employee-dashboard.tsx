import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Search, Ban, Flag, Shield, Users, AlertTriangle, CheckCircle, Pause, Play, Eye, ArrowLeft, MessageSquare, X, Bell, ShieldAlert, Clock, Mail, User as UserIcon, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  isBanned: boolean;
  isFlagged: boolean;
  flagReason?: string;
  banReason?: string;
  isSuspended: boolean;
  suspensionReason?: string;
  suspendedBy?: string;
  suspendedAt?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface AdminNotification {
  id: number;
  type: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  flaggedContent: string;
  conversationId: number | null;
  actionTaken: string;
  isRead: string;
  createdAt: string;
}

export default function EmployeeDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: string; userId: string; userName: string } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const [activeTab, setActiveTab] = useState<'users' | 'notifications'>('users');
  const [selectedNotification, setSelectedNotification] = useState<AdminNotification | null>(null);
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ['/api/employee/users'],
  });

  const { data: notifications = [] } = useQuery<AdminNotification[]>({
    queryKey: ['/api/admin/notifications'],
    refetchInterval: 15000,
  });

  const { data: unreadData } = useQuery<{ count: number }>({
    queryKey: ['/api/admin/notifications/unread-count'],
    refetchInterval: 10000,
  });

  const unreadCount = unreadData?.count || 0;

  const { data: userChats } = useQuery<{ user: any; total: number; conversations: any[] }>({
    queryKey: ['/api/super-admin/user', selectedUserId, 'conversations'],
    queryFn: async () => {
      const res = await fetch(`/api/super-admin/user/${selectedUserId}/conversations`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!selectedUserId,
  });

  const markReadMutation = useMutation({
    mutationFn: (id: number) => apiRequest('POST', `/api/admin/notifications/${id}/read`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications/unread-count'] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/admin/notifications/read-all'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/notifications/unread-count'] });
    },
  });

  const banMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', `/api/employee/users/${userId}/ban`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee/users'] });
      setActionModal(null);
      setActionReason('');
    },
  });

  const unbanMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('POST', `/api/employee/users/${userId}/unban`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/employee/users'] }),
  });

  const flagMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', `/api/employee/users/${userId}/flag`, { reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee/users'] });
      setActionModal(null);
      setActionReason('');
    },
  });

  const unflagMutation = useMutation({
    mutationFn: (userId: string) => apiRequest('POST', `/api/employee/users/${userId}/unflag`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/employee/users'] }),
  });

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason: string }) =>
      apiRequest('POST', `/api/employee/users/${userId}/suspend`, {
        reason,
        employeeId: currentUser?.id || '',
        employeeUsername: currentUser?.email || 'admin',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/employee/users'] });
      setActionModal(null);
      setActionReason('');
    },
  });

  const unsuspendMutation = useMutation({
    mutationFn: (userId: string) =>
      apiRequest('POST', `/api/employee/users/${userId}/unsuspend`, {
        employeeId: currentUser?.id || '',
        employeeUsername: currentUser?.email || 'admin',
      }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['/api/employee/users'] }),
  });

  const filteredUsers = users.filter(user => {
    const name = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toString().includes(searchTerm);

    const matchesFilter =
      filterStatus === 'all' ||
      (filterStatus === 'banned' && user.isBanned) ||
      (filterStatus === 'flagged' && user.isFlagged) ||
      (filterStatus === 'suspended' && user.isSuspended) ||
      (filterStatus === 'active' && !user.isBanned && !user.isFlagged && !user.isSuspended);

    return matchesSearch && matchesFilter;
  });

  const stats = {
    total: users.length,
    active: users.filter(u => !u.isBanned && !u.isFlagged && !u.isSuspended).length,
    banned: users.filter(u => u.isBanned).length,
    flagged: users.filter(u => u.isFlagged).length,
    suspended: users.filter(u => u.isSuspended).length,
  };

  const handleAction = () => {
    if (!actionModal || !actionReason.trim()) return;
    const { type, userId } = actionModal;
    if (type === 'ban') banMutation.mutate({ userId, reason: actionReason.trim() });
    else if (type === 'flag') flagMutation.mutate({ userId, reason: actionReason.trim() });
    else if (type === 'suspend') suspendMutation.mutate({ userId, reason: actionReason.trim() });
  };

  if (selectedUserId) {
    const selectedUser = users.find(u => u.id === selectedUserId);
    return (
      <div className="min-h-screen bg-black text-white p-4 md:p-6">
        <div className="max-w-5xl mx-auto">
          <Button variant="ghost" onClick={() => setSelectedUserId(null)} className="mb-4 text-gray-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Users
          </Button>

          <Card className="bg-gray-900 border-gray-800 mb-6">
            <CardHeader>
              <CardTitle className="text-xl text-white">
                {selectedUser?.firstName} {selectedUser?.lastName}
                <span className="text-sm text-gray-400 ml-2">({selectedUser?.email})</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 flex-wrap text-sm">
                <span className="px-2 py-1 rounded bg-blue-600/20 text-blue-400">
                  {selectedUser?.subscriptionTier?.toUpperCase() || 'FREE'}
                </span>
                {selectedUser?.isBanned && <span className="px-2 py-1 rounded bg-red-600/20 text-red-400">BANNED</span>}
                {selectedUser?.isFlagged && <span className="px-2 py-1 rounded bg-yellow-600/20 text-yellow-400">FLAGGED</span>}
                {selectedUser?.isSuspended && <span className="px-2 py-1 rounded bg-orange-600/20 text-orange-400">SUSPENDED</span>}
                {!selectedUser?.isBanned && !selectedUser?.isFlagged && !selectedUser?.isSuspended && (
                  <span className="px-2 py-1 rounded bg-green-600/20 text-green-400">ACTIVE</span>
                )}
              </div>
            </CardContent>
          </Card>

          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-400" /> Chat History ({userChats?.total || 0} conversations)
          </h3>

          {userChats?.conversations && userChats.conversations.length > 0 ? (
            <div className="space-y-4">
              {userChats.conversations.map((conv: any) => (
                <Card key={conv.id} className="bg-gray-900 border-gray-800">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-300">
                      {conv.title || 'Untitled'} - {new Date(conv.createdAt).toLocaleString()}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ViewConversationMessages conversationId={conv.id} />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No conversations found for this user.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-red-500 to-red-700 bg-clip-text text-transparent">
              Admin Panel
            </h1>
            <p className="text-gray-400 text-sm mt-1">User management and oversight</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white">
                <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex gap-2 mb-6">
          <Button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 ${activeTab === 'users' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
          >
            <Users className="w-4 h-4" /> Users
          </Button>
          <Button
            onClick={() => setActiveTab('notifications')}
            className={`flex items-center gap-2 relative ${activeTab === 'notifications' ? 'bg-gray-700 text-white' : 'bg-gray-900 text-gray-400 hover:text-white'}`}
          >
            <Bell className="w-4 h-4" /> Notifications
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </Button>
        </div>

        {activeTab === 'notifications' ? (
          <NotificationsPanel
            notifications={notifications}
            unreadCount={unreadCount}
            onMarkRead={(id) => markReadMutation.mutate(id)}
            onMarkAllRead={() => markAllReadMutation.mutate()}
            onViewUser={(userId) => { setSelectedUserId(userId); setActiveTab('users'); }}
            selectedNotification={selectedNotification}
            onSelectNotification={setSelectedNotification}
          />
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Users className="w-5 h-5 text-blue-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <div className="text-xs text-gray-400">Total</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.active}</div>
                  <div className="text-xs text-gray-400">Active</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Ban className="w-5 h-5 text-red-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.banned}</div>
                  <div className="text-xs text-gray-400">Banned</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800">
                <CardContent className="p-4 text-center">
                  <Flag className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.flagged}</div>
                  <div className="text-xs text-gray-400">Flagged</div>
                </CardContent>
              </Card>
              <Card className="bg-gray-900 border-gray-800 col-span-2 md:col-span-1">
                <CardContent className="p-4 text-center">
                  <Pause className="w-5 h-5 text-orange-400 mx-auto mb-1" />
                  <div className="text-2xl font-bold">{stats.suspended}</div>
                  <div className="text-xs text-gray-400">Suspended</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-gray-900 border-gray-800 mb-6">
              <CardContent className="p-4">
                <div className="flex gap-3 flex-wrap items-center">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <Input
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search by name or email..."
                      className="pl-9 bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white text-sm"
                  >
                    <option value="all">All Users</option>
                    <option value="active">Active</option>
                    <option value="banned">Banned</option>
                    <option value="flagged">Flagged</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-900 border-gray-800">
              <CardContent className="p-0">
                {isLoading ? (
                  <div className="p-8 text-center text-gray-400">Loading users...</div>
                ) : filteredUsers.length === 0 ? (
                  <div className="p-8 text-center text-gray-400">No users found</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-800 bg-gray-800/50">
                          <th className="text-left p-3 text-sm font-medium text-gray-300">Name</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-300">Email</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-300">Plan</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-300">Status</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-300">Joined</th>
                          <th className="text-left p-3 text-sm font-medium text-gray-300">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-800/50 hover:bg-gray-800/30">
                            <td className="p-3">
                              <div className="font-medium text-white">{user.firstName} {user.lastName}</div>
                              <div className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}...</div>
                            </td>
                            <td className="p-3 text-sm text-gray-300">{user.email || '-'}</td>
                            <td className="p-3">
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                user.subscriptionTier === 'research' ? 'bg-purple-600/20 text-purple-400' :
                                user.subscriptionTier === 'pro' ? 'bg-blue-600/20 text-blue-400' :
                                'bg-gray-600/20 text-gray-400'
                              }`}>
                                {(user.subscriptionTier || 'free').toUpperCase()}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1 flex-wrap">
                                {user.isBanned && <span className="text-xs px-2 py-0.5 rounded bg-red-600/20 text-red-400">BANNED</span>}
                                {user.isFlagged && <span className="text-xs px-2 py-0.5 rounded bg-yellow-600/20 text-yellow-400">FLAGGED</span>}
                                {user.isSuspended && <span className="text-xs px-2 py-0.5 rounded bg-orange-600/20 text-orange-400">SUSPENDED</span>}
                                {!user.isBanned && !user.isFlagged && !user.isSuspended && (
                                  <span className="text-xs px-2 py-0.5 rounded bg-green-600/20 text-green-400">ACTIVE</span>
                                )}
                              </div>
                              {(user.banReason || user.flagReason || user.suspensionReason) && (
                                <div className="text-xs text-gray-500 mt-1">{user.banReason || user.flagReason || user.suspensionReason}</div>
                              )}
                            </td>
                            <td className="p-3 text-sm text-gray-400">
                              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '-'}
                            </td>
                            <td className="p-3">
                              <div className="flex gap-1 flex-wrap">
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="h-7 px-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20"
                                  onClick={() => setSelectedUserId(user.id)}
                                >
                                  <Eye className="w-3 h-3 mr-1" /> View
                                </Button>
                                {!user.isBanned ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                    onClick={() => setActionModal({ type: 'ban', userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                                  >
                                    <Ban className="w-3 h-3 mr-1" /> Ban
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                    onClick={() => unbanMutation.mutate(user.id)}
                                    disabled={unbanMutation.isPending}
                                  >
                                    Unban
                                  </Button>
                                )}
                                {!user.isFlagged ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-900/20"
                                    onClick={() => setActionModal({ type: 'flag', userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                                  >
                                    <Flag className="w-3 h-3 mr-1" /> Flag
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-gray-400 hover:text-gray-300"
                                    onClick={() => unflagMutation.mutate(user.id)}
                                    disabled={unflagMutation.isPending}
                                  >
                                    Unflag
                                  </Button>
                                )}
                                {!user.isSuspended ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-orange-400 hover:text-orange-300 hover:bg-orange-900/20"
                                    onClick={() => setActionModal({ type: 'suspend', userId: user.id, userName: `${user.firstName} ${user.lastName}` })}
                                  >
                                    <Pause className="w-3 h-3 mr-1" /> Suspend
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-7 px-2 text-green-400 hover:text-green-300 hover:bg-green-900/20"
                                    onClick={() => unsuspendMutation.mutate(user.id)}
                                    disabled={unsuspendMutation.isPending}
                                  >
                                    <Play className="w-3 h-3 mr-1" /> Unsuspend
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {actionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-900 border-gray-700 w-full max-w-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white capitalize">{actionModal.type} User</CardTitle>
              <Button variant="ghost" size="sm" onClick={() => { setActionModal(null); setActionReason(''); }}>
                <X className="w-4 h-4" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300 text-sm">
                Are you sure you want to {actionModal.type} <strong>{actionModal.userName}</strong>?
              </p>
              <div>
                <label className="text-sm text-gray-400 mb-1 block">Reason</label>
                <Input
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  placeholder={`Enter reason for ${actionModal.type}...`}
                  className="bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button variant="ghost" onClick={() => { setActionModal(null); setActionReason(''); }} className="text-gray-400">
                  Cancel
                </Button>
                <Button
                  onClick={handleAction}
                  disabled={!actionReason.trim() || banMutation.isPending || flagMutation.isPending || suspendMutation.isPending}
                  className={`${
                    actionModal.type === 'ban' ? 'bg-red-600 hover:bg-red-700' :
                    actionModal.type === 'flag' ? 'bg-yellow-600 hover:bg-yellow-700' :
                    'bg-orange-600 hover:bg-orange-700'
                  } text-white`}
                >
                  Confirm {actionModal.type}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

function NotificationsPanel({
  notifications,
  unreadCount,
  onMarkRead,
  onMarkAllRead,
  onViewUser,
  selectedNotification,
  onSelectNotification,
}: {
  notifications: AdminNotification[];
  unreadCount: number;
  onMarkRead: (id: number) => void;
  onMarkAllRead: () => void;
  onViewUser: (userId: string) => void;
  selectedNotification: AdminNotification | null;
  onSelectNotification: (n: AdminNotification | null) => void;
}) {
  if (selectedNotification) {
    const n = selectedNotification;
    return (
      <div>
        <Button variant="ghost" onClick={() => onSelectNotification(null)} className="mb-4 text-gray-400 hover:text-white">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Notifications
        </Button>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-white flex items-center gap-2">
                <ShieldAlert className={`w-5 h-5 ${n.type === 'threat' ? 'text-red-500' : 'text-yellow-500'}`} />
                {n.type === 'threat' ? 'Threat Detected' : 'Inappropriate Content Detected'}
              </CardTitle>
              <span className={`text-xs px-2 py-1 rounded font-medium ${
                n.type === 'threat' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'
              }`}>
                {n.type.toUpperCase()}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-blue-400" /> User Information
                </h4>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Name</span>
                    <span className="text-white text-sm font-medium">{n.userFirstName} {n.userLastName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Email</span>
                    <span className="text-white text-sm">{n.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">User ID</span>
                    <span className="text-white text-sm font-mono">{n.userId.slice(0, 12)}...</span>
                  </div>
                  {n.conversationId && (
                    <div className="flex justify-between">
                      <span className="text-gray-400 text-sm">Conversation</span>
                      <span className="text-white text-sm">#{n.conversationId}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-400" /> Event Details
                </h4>
                <div className="bg-gray-800 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Date</span>
                    <span className="text-white text-sm">{new Date(n.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Time</span>
                    <span className="text-white text-sm">{new Date(n.createdAt).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 text-sm">Status</span>
                    <span className={`text-sm ${n.isRead === 'true' ? 'text-gray-400' : 'text-green-400 font-medium'}`}>
                      {n.isRead === 'true' ? 'Read' : 'Unread'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" /> Flagged Message
              </h4>
              <div className="bg-red-900/20 border border-red-800/50 rounded-lg p-4">
                <p className="text-red-200 text-sm break-words whitespace-pre-wrap">{n.flaggedContent}</p>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-green-400" /> Action Taken
              </h4>
              <div className="bg-gray-800 rounded-lg p-4">
                <p className="text-gray-300 text-sm">{n.actionTaken}</p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                onClick={() => onViewUser(n.userId)}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                <Eye className="w-4 h-4 mr-2" /> View User Profile & Chats
              </Button>
              {n.isRead === 'false' && (
                <Button
                  onClick={() => onMarkRead(n.id)}
                  variant="outline"
                  className="border-gray-700 text-gray-300 hover:text-white"
                >
                  <CheckCircle className="w-4 h-4 mr-2" /> Mark as Read
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-yellow-400" />
          Content Moderation Alerts
          {unreadCount > 0 && (
            <span className="bg-red-600 text-white text-xs rounded-full px-2 py-0.5 ml-2">{unreadCount} new</span>
          )}
        </h2>
        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={onMarkAllRead}
            className="border-gray-700 text-gray-300 hover:text-white"
          >
            <CheckCircle className="w-3 h-3 mr-1" /> Mark All Read
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="bg-gray-900 border-gray-800">
          <CardContent className="p-8 text-center">
            <Shield className="w-12 h-12 text-green-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">No moderation alerts yet. All clear!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`border cursor-pointer transition-colors hover:bg-gray-800/50 ${
                n.isRead === 'false'
                  ? 'bg-gray-900 border-red-800/50'
                  : 'bg-gray-900/50 border-gray-800'
              }`}
              onClick={() => {
                onSelectNotification(n);
                if (n.isRead === 'false') onMarkRead(n.id);
              }}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`mt-1 p-2 rounded-full ${
                    n.type === 'threat' ? 'bg-red-600/20' : 'bg-yellow-600/20'
                  }`}>
                    <ShieldAlert className={`w-4 h-4 ${
                      n.type === 'threat' ? 'text-red-400' : 'text-yellow-400'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-white text-sm font-medium">
                        {n.userFirstName} {n.userLastName}
                      </span>
                      <span className="text-gray-500 text-xs">{n.userEmail}</span>
                      {n.isRead === 'false' && (
                        <span className="bg-red-600 rounded-full w-2 h-2 flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-gray-400 text-sm truncate">
                      {n.flaggedContent.length > 100 ? n.flaggedContent.slice(0, 100) + '...' : n.flaggedContent}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className={`px-1.5 py-0.5 rounded ${
                        n.type === 'threat' ? 'bg-red-600/20 text-red-400' : 'bg-yellow-600/20 text-yellow-400'
                      }`}>
                        {n.type.toUpperCase()}
                      </span>
                      <span>{new Date(n.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <Eye className="w-4 h-4 text-gray-500 mt-2 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function ViewConversationMessages({ conversationId }: { conversationId: number }) {
  const { data: messages = [] } = useQuery<Array<{ id: number; content: string; role: string; timestamp: string }>>({
    queryKey: ['/api/conversations', conversationId, 'messages'],
    queryFn: async () => {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, { credentials: 'include' });
      if (!res.ok) return [];
      return res.json();
    },
  });

  if (messages.length === 0) return <p className="text-gray-500 text-sm">No messages</p>;

  return (
    <div className="space-y-2 max-h-60 overflow-y-auto">
      {messages.map((msg) => (
        <div key={msg.id} className={`text-sm p-2 rounded ${msg.role === 'user' ? 'bg-blue-900/20 text-blue-200' : 'bg-gray-800 text-gray-300'}`}>
          <span className="text-xs text-gray-500 font-medium uppercase">{msg.role}: </span>
          <span>{msg.content.length > 300 ? msg.content.slice(0, 300) + '...' : msg.content}</span>
        </div>
      ))}
    </div>
  );
}
