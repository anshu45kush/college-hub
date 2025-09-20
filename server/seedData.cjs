const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User.cjs');
const Timetable = require('./models/Timetable.cjs');
const Attendance = require('./models/Attendance.cjs');
const path = require('path');

// Load environment variables from server/.env
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected for seeding...');
  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Clear existing users
    await User.deleteMany({});
    console.log('Cleared existing users');

    // Create admin user
    const adminUser = new User({
      name: 'Admin User',
      email: process.env.ADMIN_EMAIL || 'admin@college.edu',
      password: process.env.ADMIN_PASSWORD || 'admin123',
      role: 'admin'
    });
    await adminUser.save();
    console.log('Admin user created');

    // Create teachers
    const teachers = [
      {
        name: 'Dr. Robert Wilson',
        email: 'robert.wilson@college.edu',
        password: 'teacher123',
        role: 'teacher',
        employeeId: 'T001',
        department: 'Computer Science'
      },
      {
        name: 'Prof. Sarah Johnson',
        email: 'sarah.johnson@college.edu',
        password: 'teacher123',
        role: 'teacher',
        employeeId: 'T002',
        department: 'Computer Science'
      },
      {
        name: 'Dr. Michael Brown',
        email: 'michael.brown@college.edu',
        password: 'teacher123',
        role: 'teacher',
        employeeId: 'T003',
        department: 'Electrical'
      }
    ];

    const createdTeachers = await User.insertMany(teachers);
    console.log('Teachers created');

    // Create students
    const students = [
      {
        name: 'John Doe',
        email: 'john.doe@college.edu',
        password: 'student123',
        role: 'student',
        branch: 'Computer Science',
        semester: 6,
        rollNumber: 'CS2021001'
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@college.edu',
        password: 'student123',
        role: 'student',
        branch: 'Computer Science',
        semester: 6,
        rollNumber: 'CS2021002'
      },
      {
        name: 'Alice Johnson',
        email: 'alice.johnson@college.edu',
        password: 'student123',
        role: 'student',
        branch: 'Computer Science',
        semester: 4,
        rollNumber: 'CS2022001'
      },
      {
        name: 'Bob Wilson',
        email: 'bob.wilson@college.edu',
        password: 'student123',
        role: 'student',
        branch: 'Electrical',
        semester: 4,
        rollNumber: 'EC2022001'
      },
      {
        name: 'Charlie Brown',
        email: 'charlie.brown@college.edu',
        password: 'student123',
        role: 'student',
        branch: 'Electrical',
        semester: 6,
        rollNumber: 'EC2021001'
      }
    ];

    const createdStudents = await User.insertMany(students);
    console.log('Students created');

    return { teachers: createdTeachers, students: createdStudents };
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

const seedTimetables = async (teachers) => {
  try {
    // Clear existing timetables
    await Timetable.deleteMany({});
    console.log('Cleared existing timetables');

    const timetables = [
      {
        subject: 'Data Structures',
        teacher: teachers[0]._id,
        teacherName: teachers[0].name,
        time: '09:00 - 10:00',
        room: 'CS-101',
        branch: 'Computer Science',
        semester: 6,
        day: 'Monday',
        type: 'theory',
        createdBy: teachers[0]._id
      },
      {
        subject: 'Database Management',
        teacher: teachers[1]._id,
        teacherName: teachers[1].name,
        time: '10:15 - 11:15',
        room: 'CS-102',
        branch: 'Computer Science',
        semester: 6,
        day: 'Monday',
        type: 'theory',
        createdBy: teachers[1]._id
      },
      {
        subject: 'Software Engineering',
        teacher: teachers[0]._id,
        teacherName: teachers[0].name,
        time: '11:30 - 12:30',
        room: 'CS-103',
        branch: 'Computer Science',
        semester: 6,
        day: 'Monday',
        type: 'theory',
        createdBy: teachers[0]._id
      },
      {
        subject: 'Computer Networks',
        teacher: teachers[1]._id,
        teacherName: teachers[1].name,
        time: '14:00 - 15:00',
        room: 'CS-104',
        branch: 'Computer Science',
        semester: 6,
        day: 'Tuesday',
        type: 'theory',
        createdBy: teachers[1]._id
      },
      {
        subject: 'Web Development Lab',
        teacher: teachers[0]._id,
        teacherName: teachers[0].name,
        time: '15:15 - 17:15',
        room: 'CS-Lab1',
        branch: 'Computer Science',
        semester: 6,
        day: 'Tuesday',
        type: 'lab',
        createdBy: teachers[0]._id
      },
      // Electrical subjects
      {
        subject: 'Digital Electrical',
        teacher: teachers[2]._id,
        teacherName: teachers[2].name,
        time: '09:00 - 10:00',
        room: 'EC-101',
        branch: 'Electrical',
        semester: 4,
        day: 'Monday',
        type: 'theory',
        createdBy: teachers[2]._id
      },
      {
        subject: 'Microprocessors',
        teacher: teachers[2]._id,
        teacherName: teachers[2].name,
        time: '10:15 - 11:15',
        room: 'EC-102',
        branch: 'Electrical',
        semester: 6,
        day: 'Monday',
        type: 'theory',
        createdBy: teachers[2]._id
      }
    ];

    await Timetable.insertMany(timetables);
    console.log('Timetables created');
  } catch (error) {
    console.error('Error seeding timetables:', error);
    throw error;
  }
};

const seedAttendance = async (students, teachers) => {
  try {
    // Clear existing attendance
    await Attendance.deleteMany({});
    console.log('Cleared existing attendance');

    const attendance = [];
    const subjects = ['Data Structures', 'Database Management', 'Software Engineering'];
    const statuses = ['present', 'absent', 'late'];
    
    // Generate attendance for the last 30 days
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      students.forEach(student => {
        if (student.branch === 'Computer Science' && student.semester === 6) {
          subjects.forEach(subject => {
            // 80% chance of being present
            const status = Math.random() < 0.8 ? 'present' : 
                          Math.random() < 0.9 ? 'absent' : 'late';
            
            attendance.push({
              student: student._id,
              studentName: student.name,
              rollNumber: student.rollNumber,
              subject,
              teacher: teachers[0]._id, // Dr. Robert Wilson
              teacherName: teachers[0].name,
              date,
              status,
              branch: student.branch,
              semester: student.semester,
              markedBy: teachers[0]._id
            });
          });
        }
      });
    }

    await Attendance.insertMany(attendance);
    console.log('Attendance records created');
  } catch (error) {
    console.error('Error seeding attendance:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    await connectDB();
    
    console.log('Starting database seeding...');
    
    const { teachers, students } = await seedUsers();
    await seedTimetables(teachers);
    await seedAttendance(students, teachers);
    
    console.log('Database seeding completed successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@college.edu / admin123');
    console.log('Teacher: robert.wilson@college.edu / teacher123');
    console.log('Student: john.doe@college.edu / student123');
    
    process.exit(0);
  } catch (error) {
    console.error('Database seeding failed:', error);
    process.exit(1);
  }
};

// Run seeding if this file is executed directly
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;