import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';
import { Link } from 'wouter';
import { Search, Ban, Flag, Shield, Users, AlertTriangle, CheckCircle, Pause, Play, Eye, ArrowLeft, MessageSquare, X } from 'lucide-react';
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

interface ConversationData {
  conversation: {
    id: number;
    title: string;
    userId: string;
    createdAt: string;
  };
  messages: Array<{
    id: number;
    content: string;
    role: string;
    timestamp: string;
  }>;
}

export default function EmployeeDashboard() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [actionModal, setActionModal] = useState<{ type: string; userId: string; userName: string } | null>(null);
  const [actionReason, setActionReason] = useState('');
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuth();

  const { data: users = [], isLoading } = useQuery<UserData[]>({
    queryKey: ['/api/employee/users'],
  });

  const { data: userChats } = useQuery<{ user: any; total: number; conversations: any[] }>({
    queryKey: ['/api/super-admin/user', selectedUserId, 'conversations'],
    queryFn: async () => {
      const res = await fetch(`/api/super-admin/user/${selectedUserId}/conversations`, { credentials: 'include' });
      if (!res.ok) throw new Error('Failed to fetch');
      return res.json();
    },
    enabled: !!selectedUserId,
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
          <Link href="/">
            <Button variant="outline" size="sm" className="border-gray-700 text-gray-300 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" /> Back to App
            </Button>
          </Link>
        </div>

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
