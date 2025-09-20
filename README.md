# College Academic Hub

A comprehensive role-based dashboard system for college management with separate interfaces for Students, Teachers, and Admins.

## Features

### Student Dashboard
- View personal timetable by branch and semester
- Track attendance percentage with visual progress bars
- Receive notifications for timetable changes and low attendance alerts
- Quick summary cards for upcoming classes and statistics

### Teacher Dashboard
- Upload, edit, update, and delete timetables per branch/semester
- Mark attendance manually with bulk operations
- View student attendance logs with filtering options
- Dashboard with quick actions and statistics

### Admin Dashboard
- Manage users: add/edit/delete students and teachers
- Oversee all timetable uploads and attendance data
- Analytics panel with attendance summaries and statistics
- Complete system oversight and user management

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Vite** for build tooling
- Responsive design with mobile-first approach

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** authentication with role-based access control
- **bcryptjs** for password hashing
- **CORS**, **Helmet**, and **Rate Limiting** for security

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd college-academic-hub
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   MONGODB_URI=mongodb://localhost:27017/college_academic_hub
   JWT_SECRET=your_super_secure_jwt_secret_key_here
   JWT_EXPIRES_IN=7d
   PORT=5000
   NODE_ENV=development
   FRONTEND_URL=http://localhost:5173
   ADMIN_EMAIL=admin@college.edu
   ADMIN_PASSWORD=admin123
   ```

4. **Start MongoDB**
   - For local MongoDB: `mongod`
   - For MongoDB Atlas: Ensure your connection string is correct in `.env`

5. **Seed the database**
   ```bash
   npm run seed
   ```
   
   This will create sample users, timetables, and attendance records.

6. **Start the backend server**
   ```bash
   npm run server:dev
   ```
   
   The API will be available at `http://localhost:5000`

7. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   
   The application will be available at `http://localhost:5173`

### Default Login Credentials

After seeding the database, you can use these credentials:

- **Admin**: admin@college.edu / admin123
- **Teacher**: robert.wilson@college.edu / teacher123
- **Student**: john.doe@college.edu / student123

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Get current user profile
- `PUT /api/auth/profile` - Update user profile

### Users (Admin only)
- `GET /api/users` - Get all users with filtering
- `GET /api/users/students` - Get all students
- `GET /api/users/teachers` - Get all teachers
- `POST /api/users` - Create new user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (soft delete)

### Timetables
- `GET /api/timetable` - Get timetables with filtering
- `POST /api/timetable` - Create timetable entry (Teacher/Admin)
- `PUT /api/timetable/:id` - Update timetable entry (Teacher/Admin)
- `DELETE /api/timetable/:id` - Delete timetable entry (Teacher/Admin)

### Attendance
- `GET /api/attendance` - Get attendance records with filtering
- `GET /api/attendance/stats` - Get attendance statistics
- `POST /api/attendance` - Mark attendance (Teacher/Admin)
- `POST /api/attendance/bulk` - Mark bulk attendance (Teacher/Admin)
- `PUT /api/attendance/:id` - Update attendance record (Teacher/Admin)
- `DELETE /api/attendance/:id` - Delete attendance record (Admin only)

## Database Schema

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: ['student', 'teacher', 'admin'],
  // Student fields
  branch: String,
  semester: Number,
  rollNumber: String (unique),
  // Teacher fields
  employeeId: String (unique),
  department: String,
  // Common fields
  isActive: Boolean,
  lastLogin: Date
}
```

### Timetable Model
```javascript
{
  subject: String,
  teacher: ObjectId (ref: User),
  teacherName: String,
  time: String,
  room: String,
  branch: String,
  semester: Number,
  day: String,
  type: ['theory', 'lab', 'tutorial'],
  isActive: Boolean,
  createdBy: ObjectId (ref: User)
}
```

### Attendance Model
```javascript
{
  student: ObjectId (ref: User),
  studentName: String,
  rollNumber: String,
  subject: String,
  teacher: ObjectId (ref: User),
  teacherName: String,
  date: Date,
  status: ['present', 'absent', 'late'],
  branch: String,
  semester: Number,
  remarks: String,
  markedBy: ObjectId (ref: User)
}
```

## Security Features

- **JWT Authentication** with secure token handling
- **Role-based Access Control** (RBAC)
- **Password Hashing** with bcryptjs
- **Rate Limiting** to prevent abuse
- **CORS Configuration** for cross-origin requests
- **Helmet** for security headers
- **Input Validation** and sanitization

## Development Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend server with nodemon
- `npm run seed` - Seed database with sample data
- `npm run lint` - Run ESLint

## Deployment

### Frontend Deployment
1. Build the frontend: `npm run build`
2. Deploy the `dist` folder to your hosting service (Netlify, Vercel, etc.)

### Backend Deployment
1. Set up MongoDB Atlas or your preferred MongoDB hosting
2. Configure environment variables on your hosting platform
3. Deploy the `server` folder to your hosting service (Heroku, Railway, etc.)
4. Run the seed script on production: `npm run seed`

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## License

This project is licensed under the MIT License.