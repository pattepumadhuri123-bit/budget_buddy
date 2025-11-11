import { useState, useEffect } from 'react';
import { X, Plus, Trash2, Users, Mail, Search } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Member = {
  id: string;
  userId?: string;
  name: string;
  email: string;
  isRegistered?: boolean;
};

type RegisteredUser = {
  id: string;
  email: string;
  full_name: string;
};

type CreateGroupModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (groupCode: string, groupId: string, groupName: string) => void;
  currentUserId: string;
  currentUserEmail: string;
};

export function CreateGroupModal({ isOpen, onClose, onSuccess, currentUserId, currentUserEmail }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState('');
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [registeredUsers, setRegisteredUsers] = useState<RegisteredUser[]>([]);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {    if (isOpen) {
      loadRegisteredUsers();
    }
  }, [isOpen]);

  const loadRegisteredUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .neq('id', currentUserId)
        .order('full_name');

      if (error) throw error;
      setRegisteredUsers(data || []);
    } catch (err) {
      console.error('Error loading users:', err);
    }
  };

  const addMember = () => {
    setMembers([...members, { id: crypto.randomUUID(), name: '', email: '', isRegistered: false }]);
  };

  const addRegisteredUser = (user: RegisteredUser) => {
    const exists = members.some(m => m.userId === user.id);
    if (exists) {
      setError('User already added');
      setTimeout(() => setError(''), 3000);
      return;
    }

    setMembers([...members, {
      id: crypto.randomUUID(),
      userId: user.id,
      name: user.full_name,
      email: user.email,
      isRegistered: true
    }]);
    setShowUserSearch(false);
    setSearchQuery('');
  };

  const filteredUsers = registeredUsers.filter(user =>
    user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeMember = (id: string) => {
    if (members.length > 1) {
      setMembers(members.filter(m => m.id !== id));
    }
  };

  const updateMember = (id: string, field: 'name' | 'email', value: string) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m));
  };

  const generateGroupCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!groupName.trim()) {
      setError('Please enter a group name');
      return;
    }

    const validMembers = members.filter(m => m.name.trim());
    if (validMembers.length === 0) {
      setError('Please add at least one member');
      return;
    }

    setLoading(true);

    try {
      const groupCode = generateGroupCode();

      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: groupName,
          code: groupCode,
          created_by: currentUserId
        })
        .select()
        .single();

      if (groupError) throw groupError;

      const { data: currentUserProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', currentUserId)
        .single();

      const memberInserts = [
        {
          group_id: groupData.id,
          user_id: currentUserId,
          name: currentUserProfile?.full_name || currentUserEmail.split('@')[0],
          email: currentUserEmail
        },
        ...validMembers.map(m => ({
          group_id: groupData.id,
          user_id: m.userId || null,
          name: m.name.trim(),
          email: m.email.trim() || null
        }))
      ];

      const { error: membersError } = await supabase
        .from('group_members')
        .insert(memberInserts);

      if (membersError) throw membersError;

      onSuccess(groupCode, groupData.id, groupName);
      setGroupName('');
      setMembers([]);
    } catch (err) {
      console.error('Error creating group:', err);
      setError('Failed to create group. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 rounded-3xl border border-white/20 w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-white">Create New Group</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300">
              {error}
            </div>
          )}

          <div className="mb-6">
            <label className="block text-white font-semibold mb-2">Group Name</label>
            <input
              type="text"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              placeholder="e.g., Apartment 4B, College Roommates"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors"
            />
          </div>

          <div className="mb-4">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-white font-semibold">Group Members (Optional)</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  className="flex items-center space-x-2 px-4 py-2 bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/30 rounded-lg text-purple-300 hover:text-purple-200 transition-all"
                >
                  <Search className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Registered User</span>
                </button>
                <button
                  type="button"
                  onClick={addMember}
                  className="flex items-center space-x-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm font-medium">Add Guest</span>
                </button>
              </div>
            </div>

            {showUserSearch && (
              <div className="mb-4 bg-white/5 border border-white/10 rounded-xl p-4">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors mb-3"
                />
                <div className="max-h-48 overflow-y-auto space-y-2">
                  {filteredUsers.length === 0 ? (
                    <div className="text-gray-400 text-sm text-center py-4">
                      {searchQuery ? 'No users found' : 'No other users available'}
                    </div>
                  ) : (
                    filteredUsers.map(user => (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => addRegisteredUser(user)}
                        className="w-full flex items-center space-x-3 p-3 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 rounded-lg transition-all text-left"
                      >
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{user.full_name}</div>
                          <div className="text-gray-400 text-sm">{user.email}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}

            <div className="space-y-3">
              {members.map((member, index) => (
                <div key={member.id} className="flex gap-3">
                  <div className="flex-1 bg-white/5 border border-white/10 rounded-xl p-4">
                    {member.isRegistered ? (
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold">
                          {member.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="text-white font-medium">{member.name}</div>
                          <div className="text-gray-400 text-sm">{member.email}</div>
                        </div>
                        <div className="px-2 py-1 bg-purple-500/20 text-purple-300 text-xs rounded-full">
                          Registered
                        </div>
                      </div>
                    ) : (
                      <div className="grid md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Name *</label>
                          <div className="flex items-center space-x-2">
                            <Users className="w-4 h-4 text-gray-500" />
                            <input
                              type="text"
                              value={member.name}
                              onChange={(e) => updateMember(member.id, 'name', e.target.value)}
                              placeholder="Member name"
                              className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-gray-400 text-xs mb-1">Email (Optional)</label>
                          <div className="flex items-center space-x-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <input
                              type="email"
                              value={member.email}
                              onChange={(e) => updateMember(member.id, 'email', e.target.value)}
                              placeholder="email@example.com"
                              className="flex-1 bg-transparent text-white placeholder-gray-600 focus:outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="w-12 h-full bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-xl flex items-center justify-center text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/50 rounded-xl text-white font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
