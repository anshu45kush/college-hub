// Mock data for demonstration purposes
export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  branch?: string;
  semester?: number;
  employeeId?: string;
}

export interface TimetableEntry {
  id: string;
  subject: string;
  teacher: string;
  time: string;
  room: string;
  branch: string;
  semester: number;
  day: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  date: string;
  status: 'present' | 'absent';
  branch: string;
  semester: number;
}

export interface Notification {
  id: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  timestamp: string;
  read: boolean;
}

// Mock current user (simulating authentication)
export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john.doe@college.edu',
  role: 'student',
  branch: 'Computer Science',
  semester: 6
};

// Mock users data
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@college.edu',
    role: 'student',
    branch: 'Computer Science',
    semester: 6
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@college.edu',
    role: 'student',
    branch: 'Electrical',
    semester: 4
  },
  {
    id: '3',
    name: 'Dr. Robert Wilson',
    email: 'robert.wilson@college.edu',
    role: 'teacher',
    employeeId: 'T001'
  },
  {
    id: '4',
    name: 'Prof. Sarah Johnson',
    email: 'sarah.johnson@college.edu',
    role: 'teacher',
    employeeId: 'T002'
  },
  {
    id: '5',
    name: 'Admin User',
    email: 'admin@college.edu',
    role: 'admin'
  }
];

// Mock timetable data
export const mockTimetable: TimetableEntry[] = [
  {
    id: '1',
    subject: 'Data Structures',
    teacher: 'Dr. Robert Wilson',
    time: '09:00 - 10:00',
    room: 'CS-101',
    branch: 'Computer Science',
    semester: 6,
    day: 'Monday'
  },
  {
    id: '2',
    subject: 'Database Management',
    teacher: 'Prof. Sarah Johnson',
    time: '10:15 - 11:15',
    room: 'CS-102',
    branch: 'Computer Science',
    semester: 6,
    day: 'Monday'
  },
  {
    id: '3',
    subject: 'Software Engineering',
    teacher: 'Dr. Robert Wilson',
    time: '11:30 - 12:30',
    room: 'CS-103',
    branch: 'Computer Science',
    semester: 6,
    day: 'Monday'
  },
  {
    id: '4',
    subject: 'Computer Networks',
    teacher: 'Prof. Sarah Johnson',
    time: '14:00 - 15:00',
    room: 'CS-104',
    branch: 'Computer Science',
    semester: 6,
    day: 'Tuesday'
  }
];

// Mock attendance data
export const mockAttendance: AttendanceRecord[] = [
  {
    id: '1',
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Data Structures',
    date: '2025-01-15',
    status: 'present',
    branch: 'Computer Science',
    semester: 6
  },
  {
    id: '2',
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Database Management',
    date: '2025-01-15',
    status: 'present',
    branch: 'Computer Science',
    semester: 6
  },
  {
    id: '3',
    studentId: '1',
    studentName: 'John Doe',
    subject: 'Software Engineering',
    date: '2025-01-15',
    status: 'absent',
    branch: 'Computer Science',
    semester: 6
  }
];

// Mock notifications
export const mockNotifications: Notification[] = [
  {
    id: '1',
    message: 'Timetable updated for Computer Science Semester 6',
    type: 'info',
    timestamp: '2025-01-15T10:30:00Z',
    read: false
  },
  {
    id: '2',
    message: 'Low attendance alert: Software Engineering (65%)',
    type: 'warning',
    timestamp: '2025-01-15T09:00:00Z',
    read: false
  },
  {
    id: '3',
    message: 'Successfully marked attendance for Database Management',
    type: 'success',
    timestamp: '2025-01-15T11:20:00Z',
    read: true
  }
];

// Helper function to calculate attendance percentage
export const calculateAttendancePercentage = (studentId: string, subject?: string) => {
  const relevantRecords = mockAttendance.filter(record => 
    record.studentId === studentId && 
    (subject ? record.subject === subject : true)
  );
  
  if (relevantRecords.length === 0) return 0;
  
  const presentCount = relevantRecords.filter(record => record.status === 'present').length;
  return Math.round((presentCount / relevantRecords.length) * 100);
};