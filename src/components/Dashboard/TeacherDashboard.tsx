import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService, TimetableEntry, AttendanceRecord, User, AttendanceStats } from '../../services/api';
import DashboardCard from '../UI/DashboardCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { 
  Calendar, 
  UserCheck, 
  Users, 
  BookOpen, 
  Upload, 
  Edit3, 
  Save,
  X,
  Plus,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface TeacherDashboardProps {
  activeTab: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Timetable state
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  const [showAddTimetable, setShowAddTimetable] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState('Computer Science');
  const [selectedSemester, setSelectedSemester] = useState(6);
  
  // Attendance state
  const [students, setStudents] = useState<User[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [attendanceFilter, setAttendanceFilter] = useState({
    branch: 'Computer Science',
    semester: 6,
    subject: '',
    startDate: '',
    endDate: ''
  });
  
  // Form state
  const [attendanceForm, setAttendanceForm] = useState({
    subject: '',
    branch: 'Computer Science',
    semester: 6,
    date: new Date().toISOString().split('T')[0]
  });
  const [selectedStudents, setSelectedStudents] = useState<{[key: string]: 'present' | 'absent' | 'late'}>({});
  
  // Notifications
  const [notifications, setNotifications] = useState<Array<{id: string, message: string, type: 'success' | 'error' | 'info'}>>([]);

  const branches = ['Computer Science', 'Electrical', 'Mechanical', 'Civil'];
  const subjects = ['Data Structures', 'Database Management', 'Software Engineering', 'Computer Networks', 'Web Development'];

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');

      const [timetableResponse, attendanceResponse, statsResponse] = await Promise.all([
        apiService.getTimetables(),
        apiService.getAttendance(),
        apiService.getAttendanceStats()
      ]);

      if (timetableResponse.success) {
        setTimetables(timetableResponse.data || []);
      }

      if (attendanceResponse.success) {
        setAttendanceRecords(attendanceResponse.data || []);
      }

      if (statsResponse.success) {
        setAttendanceStats(statsResponse.data || []);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching teacher data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async (branch: string, semester: number) => {
    try {
      const response = await apiService.getStudents({ branch, semester: semester.toString() });
      if (response.success) {
        setStudents(response.data || []);
        // Initialize attendance selection
        const initialSelection: {[key: string]: 'present' | 'absent' | 'late'} = {};
        response.data?.forEach(student => {
          initialSelection[student._id] = 'present';
        });
        setSelectedStudents(initialSelection);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      addNotification('Failed to load students', 'error');
    }
  };

  const addNotification = (message: string, type: 'success' | 'error' | 'info') => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const handleCreateTimetable = async (formData: any) => {
    try {
      const response = await apiService.createTimetable({
        ...formData,
        teacher: user?._id,
        teacherName: user?.name
      });
      
      if (response.success) {
        setTimetables(prev => [...prev, response.data!]);
        setShowAddTimetable(false);
        addNotification('Timetable entry created successfully', 'success');
      }
    } catch (error) {
      console.error('Error creating timetable:', error);
      addNotification('Failed to create timetable entry', 'error');
    }
  };

  const handleUpdateTimetable = async (id: string, formData: any) => {
    try {
      const response = await apiService.updateTimetable(id, formData);
      
      if (response.success) {
        setTimetables(prev => prev.map(t => t._id === id ? response.data! : t));
        setEditingEntry(null);
        addNotification('Timetable entry updated successfully', 'success');
      }
    } catch (error) {
      console.error('Error updating timetable:', error);
      addNotification('Failed to update timetable entry', 'error');
    }
  };

  const handleDeleteTimetable = async (id: string) => {
    try {
      const response = await apiService.deleteTimetable(id);
      
      if (response.success) {
        setTimetables(prev => prev.filter(t => t._id !== id));
        addNotification('Timetable entry deleted successfully', 'success');
      }
    } catch (error) {
      console.error('Error deleting timetable:', error);
      addNotification('Failed to delete timetable entry', 'error');
    }
  };

  const handleMarkAttendance = async () => {
    try {
      const attendanceData = Object.entries(selectedStudents).map(([studentId, status]) => ({
        student: studentId,
        status,
        subject: attendanceForm.subject,
        date: attendanceForm.date,
        branch: attendanceForm.branch,
        semester: attendanceForm.semester
      }));

      const response = await apiService.markBulkAttendance({
        attendanceList: attendanceData,
        subject: attendanceForm.subject,
        date: attendanceForm.date,
        branch: attendanceForm.branch,
        semester: attendanceForm.semester
      });

      if (response.success) {
        addNotification(`Attendance marked for ${response.data?.successful || 0} students`, 'success');
        fetchDashboardData(); // Refresh data
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      addNotification('Failed to mark attendance', 'error');
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
    const myTimetables = timetables.filter(t => t.teacher === user?._id);
    const totalStudents = attendanceStats.reduce((acc, stat) => acc + stat.totalClasses, 0);
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
               notification.type === 'error' ? <AlertCircle className="h-5 w-5 mr-2" /> :
               <AlertCircle className="h-5 w-5 mr-2" />}
              {notification.message}
            </div>
          </div>
        ))}

        {/* Welcome section */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg text-white p-6">
          <h2 className="text-2xl font-bold mb-2">Teacher Dashboard</h2>
          <p className="text-green-100">Welcome back, {user?.name}!</p>
          <p className="text-green-100">Department: {user?.department}</p>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard
            title="My Classes"
            value={myTimetables.length}
            icon={Calendar}
            description="Active timetables"
            color="green"
          />
          <DashboardCard
            title="Total Students"
            value={totalStudents}
            icon={Users}
            description="Across all classes"
            color="blue"
          />
          <DashboardCard
            title="Subjects"
            value={new Set(myTimetables.map(t => t.subject)).size}
            icon={BookOpen}
            description="Currently teaching"
            color="indigo"
          />
          <DashboardCard
            title="Avg. Attendance"
            value={`${avgAttendance}%`}
            icon={UserCheck}
            description="This month"
            color={avgAttendance >= 75 ? 'green' : avgAttendance >= 60 ? 'yellow' : 'red'}
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => setShowAddTimetable(true)}
                className="w-full flex items-center space-x-3 p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5 text-blue-500" />
                <span className="text-sm font-medium text-blue-700">Add New Timetable Entry</span>
              </button>
              <button 
                onClick={() => fetchStudents(attendanceForm.branch, attendanceForm.semester)}
                className="w-full flex items-center space-x-3 p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
              >
                <UserCheck className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium text-green-700">Mark Today's Attendance</span>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg border shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
            <div className="space-y-3">
              {attendanceRecords.slice(0, 3).map((record, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <UserCheck className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium">Attendance marked for {record.subject}</p>
                    <p className="text-xs text-gray-500">{new Date(record.date).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderTimetableManagement = () => {
    const filteredTimetables = timetables.filter(t => 
      t.teacher === user?._id &&
      t.branch === selectedBranch &&
      t.semester === selectedSemester
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Manage Timetables</h2>
            <button 
              onClick={() => setShowAddTimetable(true)}
              className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Timetable Entry
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Branch</label>
              <select
                value={selectedBranch}
                onChange={(e) => setSelectedBranch(e.target.value)}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {branches.map(branch => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(Number(e.target.value))}
                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>Semester {sem}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timetable List */}
          <div className="space-y-4">
            {filteredTimetables.map((entry) => (
              <div key={entry._id} className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">{entry.subject}</h4>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        {entry.day}
                      </div>
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 text-blue-500">🕐</span>
                        {entry.time}
                      </div>
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 text-blue-500">🏢</span>
                        {entry.room}
                      </div>
                      <div className="flex items-center">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          entry.type === 'lab' ? 'bg-purple-100 text-purple-800' :
                          entry.type === 'tutorial' ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {entry.type}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setEditingEntry(entry)}
                      className="text-indigo-600 hover:text-indigo-900 transition-colors"
                    >
                      <Edit3 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteTimetable(entry._id)}
                      className="text-red-600 hover:text-red-900 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredTimetables.length === 0 && (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No timetable entries found for the selected filters</p>
              </div>
            )}
          </div>
        </div>

        {/* Add/Edit Modal */}
        {(editingEntry || showAddTimetable) && (
          <TimetableModal
            entry={editingEntry}
            onSave={editingEntry ? 
              (data) => handleUpdateTimetable(editingEntry._id, data) :
              handleCreateTimetable
            }
            onClose={() => {
              setEditingEntry(null);
              setShowAddTimetable(false);
            }}
          />
        )}
      </div>
    );
  };

  const renderAttendanceManagement = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Mark Attendance</h2>
        
        {/* Attendance Form */}
        <div className="bg-blue-50 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">Select Class Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <select 
              value={attendanceForm.subject}
              onChange={(e) => setAttendanceForm(prev => ({...prev, subject: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select Subject</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <select 
              value={attendanceForm.branch}
              onChange={(e) => setAttendanceForm(prev => ({...prev, branch: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select 
              value={attendanceForm.semester}
              onChange={(e) => setAttendanceForm(prev => ({...prev, semester: Number(e.target.value)}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <input
              type="date"
              value={attendanceForm.date}
              onChange={(e) => setAttendanceForm(prev => ({...prev, date: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button 
            onClick={() => fetchStudents(attendanceForm.branch, attendanceForm.semester)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Load Students
          </button>
        </div>

        {/* Student List */}
        {students.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold text-gray-900">
                Students ({students.length})
              </h3>
              <button
                onClick={handleMarkAttendance}
                disabled={!attendanceForm.subject}
                className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Mark Attendance
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {students.map((student) => (
                <div key={student._id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="font-medium text-gray-900">{student.name}</p>
                      <p className="text-sm text-gray-500">{student.rollNumber}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {(['present', 'absent', 'late'] as const).map((status) => (
                      <button
                        key={status}
                        onClick={() => setSelectedStudents(prev => ({...prev, [student._id]: status}))}
                        className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                          selectedStudents[student._id] === status
                            ? status === 'present' ? 'bg-green-500 text-white' :
                              status === 'absent' ? 'bg-red-500 text-white' :
                              'bg-yellow-500 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {status}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderStudentLogs = () => {
    const filteredRecords = attendanceRecords.filter(record => 
      record.teacher === user?._id &&
      record.branch === attendanceFilter.branch &&
      record.semester === attendanceFilter.semester &&
      (!attendanceFilter.subject || record.subject === attendanceFilter.subject) &&
      (!attendanceFilter.startDate || new Date(record.date) >= new Date(attendanceFilter.startDate)) &&
      (!attendanceFilter.endDate || new Date(record.date) <= new Date(attendanceFilter.endDate))
    );

    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Student Attendance Logs</h2>
          
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <select
              value={attendanceFilter.branch}
              onChange={(e) => setAttendanceFilter(prev => ({...prev, branch: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {branches.map(branch => (
                <option key={branch} value={branch}>{branch}</option>
              ))}
            </select>
            <select
              value={attendanceFilter.semester}
              onChange={(e) => setAttendanceFilter(prev => ({...prev, semester: Number(e.target.value)}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                <option key={sem} value={sem}>Semester {sem}</option>
              ))}
            </select>
            <select
              value={attendanceFilter.subject}
              onChange={(e) => setAttendanceFilter(prev => ({...prev, subject: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Subjects</option>
              {subjects.map(subject => (
                <option key={subject} value={subject}>{subject}</option>
              ))}
            </select>
            <input
              type="date"
              value={attendanceFilter.startDate}
              onChange={(e) => setAttendanceFilter(prev => ({...prev, startDate: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Start Date"
            />
            <input
              type="date"
              value={attendanceFilter.endDate}
              onChange={(e) => setAttendanceFilter(prev => ({...prev, endDate: e.target.value}))}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="End Date"
            />
          </div>

          {/* Attendance table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
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
                {filteredRecords.map((record) => (
                  <tr key={record._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{record.studentName}</div>
                        <div className="text-sm text-gray-500">{record.rollNumber}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.subject}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(record.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${record.status === 'present' 
                          ? 'bg-green-100 text-green-800' 
                          : record.status === 'late'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                        }
                      `}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button className="text-indigo-600 hover:text-indigo-900 transition-colors">
                        <Edit3 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredRecords.length === 0 && (
            <div className="text-center py-8">
              <UserCheck className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No attendance records found for the selected filters</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Render based on active tab
  switch (activeTab) {
    case 'timetable':
      return renderTimetableManagement();
    case 'attendance':
      return renderAttendanceManagement();
    case 'students':
      return renderStudentLogs();
    default:
      return renderDashboard();
  }
};

// Timetable Modal Component
const TimetableModal: React.FC<{
  entry?: TimetableEntry | null;
  onSave: (data: any) => void;
  onClose: () => void;
}> = ({ entry, onSave, onClose }) => {
  const [formData, setFormData] = useState({
    subject: entry?.subject || '',
    time: entry?.time || '',
    room: entry?.room || '',
    branch: entry?.branch || 'Computer Science',
    semester: entry?.semester || 6,
    day: entry?.day || 'Monday',
    type: entry?.type || 'theory'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">
            {entry ? 'Edit Timetable Entry' : 'Add New Timetable Entry'}
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subject</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData(prev => ({...prev, subject: e.target.value}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
            <input
              type="text"
              value={formData.time}
              onChange={(e) => setFormData(prev => ({...prev, time: e.target.value}))}
              placeholder="09:00 - 10:00"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Room</label>
            <input
              type="text"
              value={formData.room}
              onChange={(e) => setFormData(prev => ({...prev, room: e.target.value}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
            <select
              value={formData.branch}
              onChange={(e) => setFormData(prev => ({...prev, branch: e.target.value}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Day</label>
            <select
              value={formData.day}
              onChange={(e) => setFormData(prev => ({...prev, day: e.target.value}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData(prev => ({...prev, type: e.target.value as 'theory' | 'lab' | 'tutorial'}))}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="theory">Theory</option>
              <option value="lab">Lab</option>
              <option value="tutorial">Tutorial</option>
            </select>
          </div>
          
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
              {entry ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeacherDashboard;