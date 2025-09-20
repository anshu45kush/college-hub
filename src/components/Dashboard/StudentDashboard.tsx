import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { apiService, TimetableEntry, AttendanceStats } from '../../services/api';
import DashboardCard from '../UI/DashboardCard';
import LoadingSpinner from '../UI/LoadingSpinner';
import ErrorMessage from '../UI/ErrorMessage';
import { Calendar, BarChart3, Bell, BookOpen, AlertTriangle, TrendingUp } from 'lucide-react';

interface StudentDashboardProps {
  activeTab: string;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ activeTab }) => {
  const { user } = useAuth();
  const [timetables, setTimetables] = useState<TimetableEntry[]>([]);
  const [attendanceStats, setAttendanceStats] = useState<AttendanceStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDay, setSelectedDay] = useState('Monday');

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [timetableResponse, attendanceResponse] = await Promise.all([
        apiService.getTimetables({
          branch: user?.branch || '',
          semester: user?.semester?.toString() || ''
        }),
        apiService.getAttendanceStats({
          student: user?._id || ''
        })
      ]);

      if (timetableResponse.success) {
        setTimetables(timetableResponse.data || []);
      }

      if (attendanceResponse.success) {
        setAttendanceStats(attendanceResponse.data || []);
      }
    } catch (error) {
      setError('Failed to load dashboard data');
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateOverallAttendance = () => {
    if (attendanceStats.length === 0) return 0;
    const totalPercentage = attendanceStats.reduce((sum, stat) => sum + stat.attendancePercentage, 0);
    return Math.round(totalPercentage / attendanceStats.length);
  };

  const getTodayClasses = () => {
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return timetables.filter(entry => entry.day === today);
  };

  const getNextClass = () => {
    const todayClasses = getTodayClasses();
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();

    for (const classEntry of todayClasses) {
      const [startTime] = classEntry.time.split(' - ');
      const [hours, minutes] = startTime.split(':').map(Number);
      const classTime = hours * 60 + minutes;

      if (classTime > currentTime) {
        return `${classEntry.subject} at ${startTime}`;
      }
    }
    return 'No more classes today';
  };

  const filteredTimetable = timetables.filter(entry => entry.day === selectedDay);
  const overallAttendance = calculateOverallAttendance();
  const todayClassesCount = getTodayClasses().length;
  const nextClass = getNextClass();

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
        onRetry={fetchData}
        className="m-6"
      />
    );
  }

  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Welcome section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg text-white p-6">
        <h2 className="text-2xl font-bold mb-2">
          Welcome back, {user?.name}!
        </h2>
        <p className="text-blue-100">
          {user?.branch} • Semester {user?.semester}
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard
          title="Overall Attendance"
          value={`${overallAttendance}%`}
          icon={BarChart3}
          description={overallAttendance >= 75 ? "Good standing" : "Needs improvement"}
          trend={overallAttendance >= 75 ? 'up' : 'down'}
          color={overallAttendance >= 75 ? 'green' : overallAttendance >= 60 ? 'yellow' : 'red'}
        />
        <DashboardCard
          title="Today's Classes"
          value={todayClassesCount}
          icon={Calendar}
          description={`Next: ${nextClass}`}
          color="blue"
        />
        <DashboardCard
          title="Notifications"
          value="0"
          icon={Bell}
          description="No new notifications"
          color="indigo"
        />
        <DashboardCard
          title="Current Semester"
          value={user?.semester || 0}
          icon={BookOpen}
          description={user?.branch || ''}
          color="blue"
        />
      </div>

      {/* Attendance and alerts overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subject-wise attendance */}
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
          <div className="space-y-4">
            {attendanceStats.map((stat) => (
              <div key={stat.subject} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{stat.subject}</span>
                  <span className={`text-sm font-semibold ${
                    stat.attendancePercentage >= 75 ? 'text-green-600' :
                    stat.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {stat.attendancePercentage}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${
                      stat.attendancePercentage >= 75 ? 'bg-green-500' :
                      stat.attendancePercentage >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${stat.attendancePercentage}%` }}
                  />
                </div>
                <div className="text-xs text-gray-500">
                  {stat.presentClasses}/{stat.totalClasses} classes attended
                </div>
              </div>
            ))}
            {attendanceStats.length === 0 && (
              <div className="text-center py-8">
                <p className="text-gray-500">No attendance data available</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg border shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Attendance Alerts</h3>
          <div className="space-y-3">
            {attendanceStats
              .filter(stat => stat.attendancePercentage < 75)
              .map((stat) => (
                <div key={stat.subject} className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg">
                  <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Low attendance in {stat.subject}
                    </p>
                    <p className="text-xs text-gray-500">
                      Current: {stat.attendancePercentage}% (Need 75% minimum)
                    </p>
                  </div>
                </div>
              ))}
            {attendanceStats.filter(stat => stat.attendancePercentage < 75).length === 0 && (
              <div className="text-center py-8">
                <div className="flex items-center justify-center mb-2">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
                <p className="text-green-600 font-medium">Great job!</p>
                <p className="text-sm text-gray-500">All subjects have good attendance</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderTimetable = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">My Timetable</h2>
        <p className="text-gray-600 mb-6">
          {user?.branch} - Semester {user?.semester}
        </p>
        
        {/* Day selector tabs */}
        <div className="border-b mb-6">
          <nav className="flex space-x-8" aria-label="Tabs">
            {days.map((day) => (
              <button
                key={day}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedDay === day
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
                onClick={() => setSelectedDay(day)}
              >
                {day}
              </button>
            ))}
          </nav>
        </div>

        {/* Timetable content */}
        <div className="space-y-4">
          {filteredTimetable.length > 0 ? (
            filteredTimetable.map((entry) => (
              <div
                key={entry._id}
                className="border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {entry.subject}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                        {entry.time}
                      </div>
                      <div className="flex items-center">
                        <BookOpen className="h-4 w-4 mr-2 text-blue-500" />
                        {entry.room}
                      </div>
                      <div className="flex items-center">
                        <span className="h-4 w-4 mr-2 text-blue-500">👨‍🏫</span>
                        {entry.teacherName}
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        entry.type === 'lab' ? 'bg-purple-100 text-purple-800' :
                        entry.type === 'tutorial' ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderAttendance = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border shadow-sm p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Attendance Overview</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <DashboardCard
            title="Overall Attendance"
            value={`${overallAttendance}%`}
            icon={BarChart3}
            color={overallAttendance >= 75 ? 'green' : overallAttendance >= 60 ? 'yellow' : 'red'}
          />
          <DashboardCard
            title="Classes Attended"
            value={attendanceStats.reduce((sum, stat) => sum + stat.presentClasses, 0)}
            icon={TrendingUp}
            color="green"
          />
          <DashboardCard
            title="Total Classes"
            value={attendanceStats.reduce((sum, stat) => sum + stat.totalClasses, 0)}
            icon={Calendar}
            color="blue"
          />
        </div>
        
        {/* Detailed attendance breakdown */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">Subject-wise Breakdown</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {attendanceStats.map((stat) => (
              <div key={stat.subject} className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">{stat.subject}</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Present:</span>
                    <span className="text-green-600 font-medium">{stat.presentClasses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Absent:</span>
                    <span className="text-red-600 font-medium">{stat.absentClasses}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Late:</span>
                    <span className="text-yellow-600 font-medium">{stat.lateClasses}</span>
                  </div>
                  <div className="flex justify-between text-sm font-semibold pt-2 border-t">
                    <span>Attendance:</span>
                    <span className={
                      stat.attendancePercentage >= 75 ? 'text-green-600' :
                      stat.attendancePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                    }>
                      {stat.attendancePercentage}%
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {attendanceStats.length === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">No attendance data available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Render based on active tab
  switch (activeTab) {
    case 'timetable':
      return renderTimetable();
    case 'attendance':
      return renderAttendance();
    default:
      return renderDashboard();
  }
};

export default StudentDashboard;