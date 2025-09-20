import React from 'react';
import { User } from '../../services/api';
import { 
  Calendar, 
  BarChart3, 
  Users, 
  BookOpen, 
  ClipboardList, 
  Settings, 
  Home,
  UserCheck,
  Upload,
  Shield
} from 'lucide-react';

interface SidebarProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ user, activeTab, onTabChange }) => {
  const getMenuItems = (role: User['role']) => {
    switch (role) {
      case 'student':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'timetable', label: 'Timetable', icon: Calendar },
          { id: 'attendance', label: 'Attendance', icon: BarChart3 },
        ];
      case 'teacher':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'timetable', label: 'Manage Timetable', icon: Calendar },
          { id: 'attendance', label: 'Mark Attendance', icon: UserCheck },
          { id: 'students', label: 'Student Logs', icon: ClipboardList },
        ];
      case 'admin':
        return [
          { id: 'dashboard', label: 'Dashboard', icon: Home },
          { id: 'users', label: 'User Management', icon: Users },
          { id: 'timetables', label: 'Timetable Oversight', icon: Calendar },
          { id: 'analytics', label: 'Analytics', icon: BarChart3 },
          { id: 'settings', label: 'System Settings', icon: Settings },
        ];
      default:
        return [];
    }
  };

  const menuItems = getMenuItems(user.role);

  return (
    <aside className="bg-white border-r border-gray-200 w-64 min-h-screen">
      <nav className="mt-5 px-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`
                    group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left
                    transition-colors duration-150 ease-in-out
                    ${isActive
                      ? 'bg-blue-100 text-blue-900 border-r-2 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 transition-colors duration-150 ease-in-out ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User info at bottom */}
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-white">
                {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </span>
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
            <p className="text-xs text-gray-500 capitalize">{user.role}</p>
            {user.branch && (
              <p className="text-xs text-gray-500">{user.branch}</p>
            )}
            {user.semester && (
              <p className="text-xs text-gray-500">Semester {user.semester}</p>
            )}
            {user.employeeId && (
              <p className="text-xs text-gray-500">ID: {user.employeeId}</p>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;