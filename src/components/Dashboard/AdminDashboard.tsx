import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService, User, TimetableEntry, AttendanceStats } from '../../services/api';
import DashboardCard from '../UI/DashboardCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { 
  Users, 
  Calendar, 
  BarChart3, 
  BookOpen,
  UserPlus,
  Edit3,
  Trash2,
  X,
  Save,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Settings
} from 'lucide-react';

interface AdminDashboardProps {
  activeTab: string;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Data state
  const [users, setUsers] = useState<User[]>([]);
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  
  // UI state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userFilter, setUserFilter] = useState({
    role: '',
    branch: '',
    search: ''
  });
  
  // Notifications
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [usersResponse, timetablesResponse, statsResponse] = await Promise.all([
        apiService.getUsers(),
        apiService.getTimetables(),
        apiService.getAttendanceStats()
      ]);

      if (usersResponse.success) {
        setUsers(usersResponse.data || []);
      }

      if (timetablesResponse.success) {
        setTimetables(timetablesResponse.data || []);
      }

      if (statsResponse.success) {
        setAttendanceStats(statsResponse.data || []);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      const response = await apiService.createUser(userData);
      if (response.success) {
        setUsers(prev => [...prev, response.data!]);
        setShowAddUser(false);
        addNotification('User created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      addNotification('Failed to create user', 'error');
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      const response = await apiService.updateUser(userId, userData);
      if (response.success) {
        setUsers(prev => prev.map(u => u._id === userId ? response.data! : u));
        setEditingUser(null);
        addNotification('User updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating user:', error);
      addNotification('Failed to update user', 'error');
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      const response = await apiService.deleteUser(userId);
      if (response.success) {
        setUsers(prev => prev.map(u => u._id === userId ? {...u, isActive: false} : u));
        addNotification('User deactivated successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      addNotification('Failed to deactivate user', 'error');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <ErrorMessage 
        message={error} 
        onRetry={fetchDashboardData}
        className="m-6"
      />
    );
  }

  const renderDashboard = () => {
    const totalUsers = users.length;
    const activeUsers = users.filter(u => u.isActive).length;
    const studentCount = users.filter(u => u.role === 'student' && u.isActive).length;
    const teacherCount = users.filter(u => u.role === 'teacher' && u.isActive).length;
    const totalClasses = timetables.length;
    const avgAttendance = attendanceStats.length > 0 
      ? Math.round(attendanceStats.reduce((acc, stat) => acc + stat.attendancePercentage, 0) / attendanceStats.length)
      : 0;

    return (
      <div className="space-y-6">
        {/* Notifications */}
        {notifications.map(notification => (
          <div key={notification.id} className={`
            p-4 rounded-md border-l-4 ${
              notification.type === 'success' ? 'bg-green-50 border-green-400 text-green-700' :
              notification.type === 'error' ? 'bg-red-50 border-red-400 text-red-700' :
              'bg-blue-50 border-blue-400 text-blue-700'
            }
          `}>
            <div className="flex items-center">
              {notification.type === 'success' ? <CheckCircle className="h-5 w-5 mr-2" /> :
               notification.type === 'error' ? <AlertTriangle className="h-5 w-5 mr-2" /> :
               <AlertTriangle className="h-5 w-5 mr-2" />}
              {notification.message}
            </div>
          </div>
        ))}

        {/* Welcome section */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Admin Dashboard</h2>
          <p className="text-purple-100">Welcome back, {user?.name}!</p>
          <p className="text-purple-100">System overview and management controls</p>
        </div>

        {/* System stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="Total Users"
            value={totalUsers}
            icon={Users}
            description={`${activeUsers} active`}
            color="blue"
          />
          <DashboardCard
            title="Students"
            value={studentCount}
            icon={Users}
            description="Active students"
            color="green"
          />
          <DashboardCard
            title="Teachers"
            value={teacherCount}
            icon={Users}
            description="Faculty members"
            color="indigo"
          />
          <DashboardCard
            title="Total Classes"
            value={totalClasses}
            icon={Calendar}
            description="Scheduled classes"
            color="blue"
          />
        </div>

        {/* Analytics overview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Distribution</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Students</span>
                <span className="text-sm text-gray-500">{studentCount} users</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-green-500"
                  style={{ width: `${totalUsers > 0 ? (studentCount / totalUsers) * 100 : 0}%` }}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">Teachers</span>
                <span className="text-sm text-gray-500">{teacherCount} users</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full bg-indigo-500"
                  style={{ width: `${totalUsers > 0 ? (teacherCount / totalUsers) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Activity</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="text-sm font-medium">Active Timetables</p>
                  <p className="text-xs text-gray-500">{totalClasses} total entries</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium">Average Attendance</p>
                  <p className="text-xs text-gray-500">{avgAttendance}% across all classes</p>
                </div>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
                <Shield className="h-5 w-5 text-purple-500" />
                <div>
                  <p className="text-sm font-medium">System Status</p>
                  <p className="text-xs text-gray-500">All services operational</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => setShowAddUser(true)}
              className="flex items-center space-x-3 p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
            >
              <UserPlus className="h-6 w-6 text-blue-500" />
              <div className="text-left">
                <p className="font-medium text-blue-700">Add New User</p>
                <p className="text-sm text-blue-600">Create student or teacher account</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
              <BarChart3 className="h-6 w-6 text-green-500" />
              <div className="text-left">
                <p className="font-medium text-green-700">Generate Reports</p>
                <p className="text-sm text-green-600">Attendance and analytics</p>
              </div>
            </button>
            <button className="flex items-center space-x-3 p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
              <Settings className="h-6 w-6 text-purple-500" />
              <div className="text-left">
                <p className="font-medium text-purple-700">System Settings</p>
                <p className="text-sm text-purple-600">Configure system parameters</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderUserManagement = () => {
    const filteredUsers = users.filter(user => {
      const matchesRole = !userFilter.role || user.role === userFilter.role;
      const matchesBranch = !userFilter.branch || user.branch === userFilter.branch;
      const matchesSearch = !userFilter.search || 
        user.name.toLowerCase().includes(userFilter.search.toLowerCase()) ||
        user.email.toLowerCase().includes(userFilter.search.toLowerCase()) ||
        (user.rollNumber && user.rollNumber.toLowerCase().includes(userFilter.search.toLowerCase())) ||
        (user.employeeId && user.employeeId.toLowerCase().includes(userFilter.search.toLowerCase()));
      
      return matchesRole && matchesBranch && matchesSearch;
    });

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <select
              value={userFilter.role}
              onChange={(e) => setUserFilter(prev => ({...prev, role: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Roles</option>
              <option value="student">Students</option>
              <option value="teacher">Teachers</option>
              <option value="admin">Admins</option>
            </select>
            <select
              value={userFilter.branch}
              onChange={(e) => setUserFilter(prev => ({...prev, branch: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Branches</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Electrical">Electrical</option>
              <option value="Mechanical">Mechanical</option>
              <option value="Civil">Civil</option>
            </select>
            <input
              type="text"
              placeholder="Search users..."
              value={userFilter.search}
              onChange={(e) => setUserFilter(prev => ({...prev, search: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* Users table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-white">
                            {user.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${user.role === 'student' ? 'bg-blue-100 text-blue-800' :
                          user.role === 'teacher' ? 'bg-green-100 text-green-800' :
                          'bg-purple-100 text-purple-800'
                        }
                      `}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.branch && `${user.branch}`}
                      {user.semester && ` - Sem ${user.semester}`}
                      {user.rollNumber && ` (${user.rollNumber})`}
                      {user.employeeId && `ID: ${user.employeeId}`}
                      {user.department && ` - ${user.department}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-indigo-600 hover:text-indigo-900 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      {user._id !== user._id && (
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No users found matching the current filters</p>
            </div>
          )}
        </div>

        {/* Add/Edit User Modal */}
        {(editingUser || showAddUser) && (
          <UserModal
            user={editingUser}
            onSave={editingUser ? 
              (data) => handleUpdateUser(editingUser._id, data) :
              handleCreateUser
            }
            onClose={() => {
              setEditingUser(null);
              setShowAddUser(false);
            }}
          />
        )}
      </div>
    );
  };

  const renderAnalytics = () => {
    const branchStats = users.reduce((acc, user) => {
      if (user.role === 'student' && user.branch) {
        acc[user.branch] = (acc[user.branch] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const attendanceByBranch = attendanceStats.reduce((acc, stat) => {
      // This would need to be enhanced with actual branch data from attendance
      const branch = 'Computer Science'; // Placeholder
      if (!acc[branch]) acc[branch] = [];
      acc[branch].push(stat.attendancePercentage);
      return acc;
    }, {} as Record<string, number[]>);

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">System Analytics</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Branch Distribution */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Student Distribution by Branch</h3>
              <div className="space-y-3">
                {Object.entries(branchStats).map(([branch, count]) => {
                  const percentage = users.filter(u => u.role === 'student').length > 0 
                    ? (count / users.filter(u => u.role === 'student').length) * 100 
                    : 0;
                  return (
                    <div key={branch}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{branch}</span>
                        <span className="text-sm text-gray-500">{count} students</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full bg-blue-500"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance Overview */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">Attendance Overview</h3>
              <div className="space-y-3">
                {['Computer Science', 'Electrical', 'Mechanical'].map((branch) => {
                  const attendanceRate = Math.floor(Math.random() * 25) + 70; // Mock data
                  return (
                    <div key={branch}>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700">{branch}</span>
                        <span className="text-sm text-gray-500">{attendanceRate}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            attendanceRate >= 80 ? 'bg-green-500' : 
                            attendanceRate >= 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${attendanceRate}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* System Health */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">System Health</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Database</p>
                    <p className="text-sm text-green-600">Operational</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">API Services</p>
                    <p className="text-sm text-green-600">All endpoints active</p>
                  </div>
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center">
                  <CheckCircle className="h-8 w-8 text-green-500 mr-3" />
                  <div>
                    <p className="font-medium text-green-800">Authentication</p>
                    <p className="text-sm text-green-600">Secure & functional</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render based on active tab
  switch (activeTab) {
    case 'users':
      return renderUserManagement();
    case 'timetables':
      return renderTimetableManagement();
    case 'analytics':
      return renderAnalytics();
    default:
      return renderDashboard();
  }

  // Placeholder for timetable management
  function renderTimetableManagement() {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Timetable Oversight</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <DashboardCard
              title="Total Timetables"
              value={timetables.length}
              icon={Calendar}
              description="Across all branches"
              color="blue"
            />
            <DashboardCard
              title="Active Classes"
              value={timetables.filter(t => t.isActive).length}
              icon={BookOpen}
              description="Currently scheduled"
              color="green"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teacher
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Branch/Semester
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Schedule
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {timetables.slice(0, 10).map((timetable) => (
                  <tr key={timetable._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {timetable.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {timetable.teacherName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {timetable.branch} - Sem {timetable.semester}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {timetable.day} {timetable.time}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${timetable.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                      `}>
                        {timetable.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
};

// User Modal Component
const UserModal: React.FC<{
  user?: User | null;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ user, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'student',
    branch: user?.branch || '',
    semester: user?.semester || 1,
    rollNumber: user?.rollNumber || '',
    employeeId: user?.employeeId || '',
    department: user?.department || '',
    password: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = { ...formData };
    if (!submitData.password) delete submitData.password; // Don't send empty password
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {user ? 'Edit User' : 'Add New User'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          {!user && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                required={!user}
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData(prev => ({...prev, role: e.target.value as 'student' | 'teacher' | 'admin'}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          {formData.role === 'student' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                <select
                  value={formData.branch}
                  onChange={(e) => setFormData(prev => ({...prev, branch: e.target.value}))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Select Branch</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Mechanical">Mechanical</option>
                  <option value="Civil">Civil</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
                <select
                  value={formData.semester}
                  onChange={(e) => setFormData(prev => ({...prev, semester: Number(e.target.value)}))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                    <option key={sem} value={sem}>{sem}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({...prev, rollNumber: e.target.value}))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}

          {formData.role === 'teacher' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData(prev => ({...prev, employeeId: e.target.value}))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData(prev => ({...prev, department: e.target.value}))}
                  className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </>
          )}
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 transition-colors"
            >
              {user ? 'Update' : 'Create'} User
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminDashboard;