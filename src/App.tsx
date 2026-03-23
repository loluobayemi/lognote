import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { LoginScreen } from './screens/LoginScreen';
import { StudentDashboard } from './screens/StudentDashboard';
import { SupervisorDashboard } from './screens/SupervisorDashboard';
import { AdminDashboard } from './screens/AdminDashboard';
import { NewLogEntry } from './screens/NewLogEntry';
import { ReviewLogEntry } from './screens/ReviewLogEntry';
import { RegistrationScreen } from './screens/RegistrationScreen';
import VerifyEmailScreen from './screens/VerifyEmailScreen';
import { ProfileSettings } from './screens/ProfileSettings';
import { Role, View } from './types';
import { FirebaseProvider, useFirebase, ErrorBoundary } from './context/FirebaseContext';

const AppContent: React.FC = () => {
  const { user, loading, login, logout, isAuthReady, emailVerified } = useFirebase();
  const [view, setView] = useState<View>('dashboard');
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);

  const handleLogin = async (selectedRole: Role) => {
    try {
      await login(selectedRole);
      setView('dashboard');
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setView('dashboard');
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const renderScreen = () => {
    if (loading || !isAuthReady) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-surface">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!user) {
      return <LoginScreen onLogin={handleLogin} />;
    }

    if (!emailVerified) {
      return <VerifyEmailScreen />;
    }

    const role = user.role;

    // Redirect students to registration if profile is incomplete
    if (role === 'student' && (!user.regNumber || !user.supervisorId) && view !== 'registration') {
      setView('registration');
    }

    // Special case for Admin - they might have a different layout or no layout
    if (role === 'admin') {
      return <AdminDashboard onViewChange={setView} />;
    }

    switch (view) {
      case 'dashboard':
        return role === 'student' ? (
          <StudentDashboard onViewChange={setView} />
        ) : (
          <SupervisorDashboard onViewChange={(v, id) => {
            if (id) setSelectedLogId(id);
            setView(v);
          }} />
        );
      case 'new-log':
        return <NewLogEntry onCancel={() => setView('dashboard')} onSubmit={() => setView('dashboard')} />;
      case 'review-log':
        return <ReviewLogEntry logId={selectedLogId} onViewChange={setView} />;
      case 'registration':
        return <RegistrationScreen onComplete={() => setView('dashboard')} />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <StudentDashboard onViewChange={setView} />;
    }
  };

  // Admin has its own sidebar/layout in the component
  if (user?.role === 'admin') {
    return renderScreen();
  }

  return (
    <div className="min-h-screen bg-surface selection:bg-primary-container selection:text-on-primary-container">
      {!user ? (
        renderScreen()
      ) : (
        <Layout 
          role={user.role} 
          view={view} 
          onViewChange={setView} 
          user={user}
          onLogout={handleLogout}
        >
          {renderScreen()}
        </Layout>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
};

export default App;
