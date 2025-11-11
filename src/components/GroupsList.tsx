import { useState, useEffect } from 'react';
import { Users, Plus, LogIn as JoinIcon, LogOut, Search } from 'lucide-react';
import { supabase, type Group } from '../lib/supabase';

type GroupsListProps = {
  userId: string;
  userEmail: string;
  onGroupSelect: (group: Group) => void;
  onCreateGroup: () => void;
  onLogout: () => void;
};

export function GroupsList({ userId, userEmail, onGroupSelect, onCreateGroup, onLogout }: GroupsListProps) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCode, setJoinCode] = useState('');
  const [joinError, setJoinError] = useState('');

  useEffect(() => {
    loadUserGroups();
  }, [userId]);

  const loadUserGroups = async () => {
    try {
      const { data: memberData, error: memberError } = await supabase
        .from('group_members')
        .select('group_id')
        .eq('user_id', userId);

      if (memberError) throw memberError;

      if (!memberData || memberData.length === 0) {
        setGroups([]);
        setLoading(false);
        return;
      }

      const groupIds = memberData.map(m => m.group_id);

      const { data: groupsData, error: groupsError } = await supabase
        .from('groups')
        .select('*')
        .in('id', groupIds)
        .order('created_at', { ascending: false });

      if (groupsError) throw groupsError;

      setGroups(groupsData || []);
    } catch (err) {
      console.error('Error loading groups:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    setJoinError('');

    if (!joinCode.trim()) {
      setJoinError('Please enter a group code');
      return;
    }

    try {
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('code', joinCode.toUpperCase())
        .maybeSingle();

      if (groupError) throw groupError;

      if (!groupData) {
        setJoinError('Group not found. Please check the code.');
        return;
      }

      const { data: existingMember } = await supabase
        .from('group_members')
        .select('id')
        .eq('group_id', groupData.id)
        .eq('user_id', userId)
        .maybeSingle();

      if (existingMember) {
        setJoinError('You are already a member of this group');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', userId)
        .single();

      const { error: insertError } = await supabase
        .from('group_members')
        .insert({
          group_id: groupData.id,
          user_id: userId,
          name: profile?.full_name || userEmail.split('@')[0],
          email: userEmail,
        });

      if (insertError) throw insertError;

      setJoinCode('');
      setShowJoinModal(false);
      loadUserGroups();
    } catch (err: any) {
      setJoinError(err.message || 'Failed to join group');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading your groups...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">My Groups</h1>
            <p className="text-gray-400">Signed in as {userEmail}</p>
          </div>
          <button
            onClick={onLogout}
            className="flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout</span>
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={onCreateGroup}
            className="flex items-center justify-center space-x-3 p-6 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/50 rounded-2xl text-white font-semibold transition-all"
          >
            <Plus className="w-6 h-6" />
            <span>Create New Group</span>
          </button>

          <button
            onClick={() => setShowJoinModal(true)}
            className="flex items-center justify-center space-x-3 p-6 bg-white/5 hover:bg-white/10 border border-white/20 rounded-2xl text-white font-semibold transition-all"
          >
            <JoinIcon className="w-6 h-6" />
            <span>Join Existing Group</span>
          </button>
        </div>

        {groups.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-12 border border-white/10 text-center">
            <Users className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Groups Yet</h3>
            <p className="text-gray-400">Create a new group or join an existing one to get started!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map(group => (
              <button
                key={group.id}
                onClick={() => onGroupSelect(group)}
                className="bg-white/5 hover:bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/10 transition-all text-left group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-400 to-pink-400 rounded-xl flex items-center justify-center">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-xs font-mono text-orange-400 bg-orange-400/10 px-2 py-1 rounded">
                    {group.code}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors">
                  {group.name}
                </h3>
                <p className="text-gray-400 text-sm">
                  Created {new Date(group.created_at).toLocaleDateString()}
                </p>
              </button>
            ))}
          </div>
        )}
      </div>

      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 rounded-3xl border border-white/20 w-full max-w-md p-8 shadow-2xl">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white">Join Group</h2>
            </div>

            <form onSubmit={handleJoinGroup}>
              {joinError && (
                <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-300 text-sm">
                  {joinError}
                </div>
              )}

              <div className="mb-6">
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Enter Group Code
                </label>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-400 transition-colors font-mono text-lg text-center"
                  placeholder="ABC123"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode('');
                    setJoinError('');
                  }}
                  className="flex-1 px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white font-medium transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:shadow-lg hover:shadow-orange-500/50 rounded-xl text-white font-semibold transition-all"
                >
                  Join Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
