import React, { useState } from 'react';
import { mockTimetable, TimetableEntry } from '../../data/mockData';
import { Clock, MapPin, User } from 'lucide-react';

interface TimetableViewProps {
  branch?: string;
  semester?: number;
  editable?: boolean;
  onEdit?: (entry: TimetableEntry) => void;
}

const TimetableView: React.FC<TimetableViewProps> = ({ 
  branch, 
  semester, 
  editable = false, 
  onEdit 
}) => {
  const [selectedDay, setSelectedDay] = useState('Monday');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  // Filter timetable based on branch, semester, and selected day
  const filteredTimetable = mockTimetable.filter(entry => 
    (!branch || entry.branch === branch) &&
    (!semester || entry.semester === semester) &&
    entry.day === selectedDay
  );

  return (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Day selector tabs */}
      <div className="border-b">
        <nav className="flex space-x-8 px-6" aria-label="Tabs">
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
      <div className="p-6">
        <div className="space-y-4">
          {filteredTimetable.length > 0 ? (
            filteredTimetable.map((entry) => (
              <div
                key={entry.id}
                className={`
                  border-l-4 border-blue-500 bg-blue-50 rounded-r-lg p-4 hover:bg-blue-100 
                  transition-colors ${editable ? 'cursor-pointer' : ''}
                `}
                onClick={editable && onEdit ? () => onEdit(entry) : undefined}
                role={editable ? 'button' : 'presentation'}
                tabIndex={editable ? 0 : undefined}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">
                      {entry.subject}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-2 text-blue-500" />
                        {entry.time}
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-blue-500" />
                        {entry.room}
                      </div>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-blue-500" />
                        {entry.teacher}
                      </div>
                    </div>
                  </div>
                  {editable && (
                    <span className="text-blue-600 text-sm font-medium">
                      Click to edit
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No classes scheduled for {selectedDay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TimetableView;