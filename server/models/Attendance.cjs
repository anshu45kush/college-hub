const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Student is required']
  },
  studentName: {
    type: String,
    required: [true, 'Student name is required']
  },
  rollNumber: {
    type: String,
    required: [true, 'Roll number is required']
  },
  subject: {
    type: String,
    required: [true, 'Subject is required'],
    trim: true
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Teacher is required']
  },
  teacherName: {
    type: String,
    required: [true, 'Teacher name is required']
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  status: {
    type: String,
    enum: ['present', 'absent', 'late'],
    required: [true, 'Attendance status is required']
  },
  branch: {
    type: String,
    required: [true, 'Branch is required'],
    trim: true
  },
  semester: {
    type: Number,
    required: [true, 'Semester is required'],
    min: 1,
    max: 8
  },
  remarks: {
    type: String,
    trim: true,
    maxlength: [200, 'Remarks cannot exceed 200 characters']
  },
  markedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
attendanceSchema.index({ student: 1, date: -1 });
attendanceSchema.index({ branch: 1, semester: 1, subject: 1 });
attendanceSchema.index({ teacher: 1, date: -1 });

// Prevent duplicate attendance entries for same student, subject, and date
attendanceSchema.index({ 
  student: 1, 
  subject: 1, 
  date: 1 
}, { 
  unique: true,
  partialFilterExpression: { date: { $type: "date" } }
});

module.exports = mongoose.model('Attendance', attendanceSchema);