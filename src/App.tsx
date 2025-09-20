import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginForm from './components/Auth/LoginForm';
import Navbar from './components/Navigation/Navbar';
import Sidebar from './components/Navigation/Sidebar';
import StudentDashboard from './components/Dashboard/StudentDashboard';
import TeacherDashboard from './components/Dashboard/TeacherDashboard';
import AdminDashboard from './components/Dashboard/AdminDashboard';
import ProtectedRoute from './components/UI/ProtectedRoute';
import LoadingSpinner from './components/UI/LoadingSpinner';

const AppContent: React.FC = () => {
  const { user, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleLogout = () => {
    logout();
    setActiveTab('dashboard');
  };

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    switch (user.role) {
      case 'student':
        return (
          <ProtectedRoute allowedRoles={['student']}>
            <StudentDashboard activeTab={activeTab} />
          </ProtectedRoute>
        );
      case 'teacher':
        return (
          <ProtectedRoute allowedRoles={['teacher']}>
            <TeacherDashboard activeTab={activeTab} />
          </ProtectedRoute>
        );
      case 'admin':
        return (
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard activeTab={activeTab} />
          </ProtectedRoute>
        );
      default:
        return <StudentDashboard activeTab={activeTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation header */}
      <Navbar user={user} onLogout={handleLogout} />
      
      <div className="flex">
        {/* Sidebar navigation */}
        <Sidebar 
          user={user} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
        />
        
        {/* Main content area */}
        <main className="flex-1 p-6 lg:p-8 ml-0">
          <div className="max-w-7xl mx-auto">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;