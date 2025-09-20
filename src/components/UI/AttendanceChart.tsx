import React from 'react';
import { mockAttendance, calculateAttendancePercentage } from '../../data/mockData';

interface AttendanceChartProps {
  studentId: string;
}

const AttendanceChart: React.FC<AttendanceChartProps> = ({ studentId }) => {
  // Get unique subjects for the student
  const subjects = [...new Set(mockAttendance
    .filter(record => record.studentId === studentId)
    .map(record => record.subject)
  )];

  const subjectData = subjects.map(subject => ({
    subject,
    percentage: calculateAttendancePercentage(studentId, subject)
  }));

  const getColorClass = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getTextColor = (percentage: number) => {
    if (percentage >= 75) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border shadow-sm p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject-wise Attendance</h3>
      
      <div className="space-y-4">
        {subjectData.map((data) => (
          <div key={data.subject} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-gray-700">{data.subject}</span>
              <span className={`text-sm font-semibold ${getTextColor(data.percentage)}`}>
                {data.percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${getColorClass(data.percentage)}`}
                style={{ width: `${data.percentage}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {subjectData.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-500">No attendance data available</p>
        </div>
      )}
    </div>
  );
};

export default AttendanceChart;