import React from 'react';
import { User } from '../../services/api';
import NotificationsPanel from '../UI/NotificationsPanel';
import { GraduationCap, LogOut, Settings } from 'lucide-react';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const getRoleColor = (role: User['role']) => {
    switch (role) {
      case 'student': return 'bg-blue-100 text-blue-800';
      case 'teacher': return 'bg-green-100 text-green-800';
      case 'admin': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleTitle = (role: User['role']) => {
    switch (role) {
      case 'student': return 'Student Portal';
      case 'teacher': return 'Teacher Dashboard';
      case 'admin': return 'Admin Panel';
      default: return 'Academic Hub';
    }
  };

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <GraduationCap className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  College Academic Hub
                </h1>
                <p className="text-sm text-gray-500">
                  {getRoleTitle(user.role)}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {/* Current role badge */}
            <div className="hidden md:block">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRoleColor(user.role)}`}>
                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
              </span>
            </div>

            {/* User profile */}
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-white">
                    {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="hidden md:block">
                  <p className="text-sm font-medium text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-1">
                <NotificationsPanel />
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                  aria-label="Logout"
                  onClick={onLogout}
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;