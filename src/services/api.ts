import axios, { AxiosInstance, AxiosResponse } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Types
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: any[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  branch?: string;
  semester?: number;
  rollNumber?: string;
  employeeId?: string;
  department?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TimetableEntry {
  _id: string;
  subject: string;
  teacher: string;
  teacherName: string;
  time: string;
  room: string;
  branch: string;
  semester: number;
  day: string;
  type: 'theory' | 'lab' | 'tutorial';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceRecord {
  _id: string;
  student: string;
  studentName: string;
  rollNumber: string;
  subject: string;
  teacher: string;
  teacherName: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  branch: string;
  semester: number;
  remarks?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceStats {
  student: string;
  rollNumber: string;
  subject: string;
  totalClasses: number;
  presentClasses: number;
  absentClasses: number;
  lateClasses: number;
  attendancePercentage: number;
}

// API Service Class
class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor to add auth token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response: AxiosResponse) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.clearToken();
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  private handleResponse<T>(response: AxiosResponse<ApiResponse<T>>): ApiResponse<T> {
    return response.data;
  }

  private handleError(error: any): never {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    throw new Error(message);
  }

  setToken(token: string) {
    localStorage.setItem('token', token);
  }

  clearToken() {
    localStorage.removeItem('token');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<ApiResponse<{ user: User; token: string }>> {
    try {
      const response = await this.api.post('/auth/login', credentials);
      const data = this.handleResponse(response);
      
      if (data.success && data.data?.token) {
        this.setToken(data.data.token);
      }
      
      return data;
    } catch (error) {
      this.handleError(error);
    }
  }

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.api.get('/auth/me');
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateProfile(userData: Partial<User>): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await this.api.put('/auth/profile', userData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // User management endpoints
  async getUsers(params?: Record<string, string>): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/users', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getStudents(params?: Record<string, string>): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/users/students', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getTeachers(params?: Record<string, string>): Promise<ApiResponse<User[]>> {
    try {
      const response = await this.api.get('/users/teachers', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createUser(userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.post('/users', userData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateUser(userId: string, userData: Partial<User>): Promise<ApiResponse<User>> {
    try {
      const response = await this.api.put(`/users/${userId}`, userData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteUser(userId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/users/${userId}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Timetable endpoints
  async getTimetables(params?: Record<string, string>): Promise<ApiResponse<TimetableEntry[]>> {
    try {
      const response = await this.api.get('/timetable', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async createTimetable(timetableData: Partial<TimetableEntry>): Promise<ApiResponse<TimetableEntry>> {
    try {
      const response = await this.api.post('/timetable', timetableData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateTimetable(timetableId: string, timetableData: Partial<TimetableEntry>): Promise<ApiResponse<TimetableEntry>> {
    try {
      const response = await this.api.put(`/timetable/${timetableId}`, timetableData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteTimetable(timetableId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/timetable/${timetableId}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  // Attendance endpoints
  async getAttendance(params?: Record<string, string>): Promise<ApiResponse<AttendanceRecord[]>> {
    try {
      const response = await this.api.get('/attendance', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAttendanceStats(params?: Record<string, string>): Promise<ApiResponse<AttendanceStats[]>> {
    try {
      const response = await this.api.get('/attendance/stats', { params });
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async markAttendance(attendanceData: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await this.api.post('/attendance', attendanceData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async markBulkAttendance(attendanceData: any): Promise<ApiResponse> {
    try {
      const response = await this.api.post('/attendance/bulk', attendanceData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async updateAttendance(attendanceId: string, attendanceData: Partial<AttendanceRecord>): Promise<ApiResponse<AttendanceRecord>> {
    try {
      const response = await this.api.put(`/attendance/${attendanceId}`, attendanceData);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }

  async deleteAttendance(attendanceId: string): Promise<ApiResponse> {
    try {
      const response = await this.api.delete(`/attendance/${attendanceId}`);
      return this.handleResponse(response);
    } catch (error) {
      this.handleError(error);
    }
  }
}

export const apiService = new ApiService();
export default apiService;