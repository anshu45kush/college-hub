const mongoose = require('mongoose');

const timetableEntrySchema = new mongoose.Schema({
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
  time: {
    type: String,
    required: [true, 'Time is required'],
    match: [/^\d{2}:\d{2}\s-\s\d{2}:\d{2}$/, 'Time format should be HH:MM - HH:MM']
  },
  room: {
    type: String,
    required: [true, 'Room is required'],
    trim: true
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
  day: {
    type: String,
    required: [true, 'Day is required'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  },
  type: {
    type: String,
    enum: ['theory', 'lab', 'tutorial'],
    default: 'theory'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Compound index for efficient queries
timetableEntrySchema.index({ branch: 1, semester: 1, day: 1 });
timetableEntrySchema.index({ teacher: 1 });

module.exports = mongoose.model('Timetable', timetableEntrySchema);