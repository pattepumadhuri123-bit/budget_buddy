import { useState, useEffect } from 'react';
import { CreateGroupModal } from './components/CreateGroupModal';
import { GroupDashboard } from './components/GroupDashboard';
import { GroupsList } from './components/GroupsList';
import { LandingPage } from './components/LandingPage';
import { LoginPage } from './components/LoginPage';
import { supabase, type Group } from './lib/supabase';

type AppView = 'landing' | 'login' | 'groups' | 'group-dashboard';

function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeGroup, setActiveGroup] = useState<Group | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentView('groups');
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentView('groups');
      } else {
        setCurrentView('landing');
        setActiveGroup(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleGroupCreated = (code: string, id: string, name: string) => {
    setShowCreateModal(false);
    setActiveGroup({ id, code, name, created_at: new Date().toISOString(), created_by: user?.id || null });
    setCurrentView('group-dashboard');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setActiveGroup(null);
    setCurrentView('landing');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  if (currentView === 'landing') {
    return <LandingPage onGetStarted={() => setCurrentView('login')} />;
  }

  if (currentView === 'login') {
    return (
      <LoginPage
        onSuccess={() => setCurrentView('groups')}
        onBack={() => setCurrentView('landing')}
      />
    );
  }

  if (!user) {
    setCurrentView('landing');
    return null;
  }

  if (currentView === 'groups') {
    return (
      <>
        <GroupsList
          userId={user.id}
          userEmail={user.email!}
          onGroupSelect={(group) => {
            setActiveGroup(group);
            setCurrentView('group-dashboard');
          }}
          onCreateGroup={() => {
            setShowCreateModal(true);
          }}
          onLogout={handleLogout}
        />
        {showCreateModal && (
          <CreateGroupModal
            isOpen={showCreateModal}
            onClose={() => setShowCreateModal(false)}
            onSuccess={(code, id, name) => {
              handleGroupCreated(code, id, name);
            }}
            currentUserId={user.id}
            currentUserEmail={user.email!}
          />
        )}
      </>
    );
  }

  if (currentView === 'group-dashboard' && activeGroup) {
    return (
      <GroupDashboard
        groupId={activeGroup.id}
        groupCode={activeGroup.code}
        groupName={activeGroup.name}
        onClose={() => setCurrentView('groups')}
      />
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}

export default App;
