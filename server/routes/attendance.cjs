const express = require('express');
const Attendance = require('../models/Attendance.cjs');
const User = require('../models/User.cjs');
const { authenticate, authorize, checkBranchAccess } = require('../middleware/auth.cjs');

const router = express.Router();

// @route   GET /api/attendance
// @desc    Get attendance records with filtering
// @access  Private
router.get('/', authenticate, checkBranchAccess, async (req, res) => {
  try {
    const { branch, semester, subject, student, startDate, endDate, status } = req.query;
    let filter = {};

    // Build filter based on user role
    if (req.user.role === 'student') {
      filter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      filter.teacher = req.user._id;
    }

    // Add query filters
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (subject) filter.subject = subject;
    if (student) filter.student = student;
    if (status) filter.status = status;

    // Date range filter
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate);
      if (endDate) filter.date.$lte = new Date(endDate);
    }

    const attendance = await Attendance.find(filter)
      .populate('student', 'name rollNumber branch semester')
      .populate('teacher', 'name employeeId')
      .populate('markedBy', 'name')
      .sort({ date: -1 });

    res.json({
      success: true,
      count: attendance.length,
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance',
      error: error.message
    });
  }
});

// @route   GET /api/attendance/stats
// @desc    Get attendance statistics
// @access  Private
router.get('/stats', authenticate, async (req, res) => {
  try {
    const { branch, semester, subject, student } = req.query;
    let matchFilter = {};

    // Build filter based on user role
    if (req.user.role === 'student') {
      matchFilter.student = req.user._id;
    } else if (req.user.role === 'teacher') {
      matchFilter.teacher = req.user._id;
    }

    // Add query filters
    if (branch) matchFilter.branch = branch;
    if (semester) matchFilter.semester = parseInt(semester);
    if (subject) matchFilter.subject = subject;
    if (student) matchFilter.student = student;

    const stats = await Attendance.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: {
            student: '$student',
            subject: '$subject'
          },
          totalClasses: { $sum: 1 },
          presentClasses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'present'] }, 1, 0]
            }
          },
          absentClasses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'absent'] }, 1, 0]
            }
          },
          lateClasses: {
            $sum: {
              $cond: [{ $eq: ['$status', 'late'] }, 1, 0]
            }
          }
        }
      },
      {
        $addFields: {
          attendancePercentage: {
            $multiply: [
              { $divide: ['$presentClasses', '$totalClasses'] },
              100
            ]
          }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id.student',
          foreignField: '_id',
          as: 'studentInfo'
        }
      },
      {
        $unwind: '$studentInfo'
      },
      {
        $project: {
          student: '$studentInfo.name',
          rollNumber: '$studentInfo.rollNumber',
          subject: '$_id.subject',
          totalClasses: 1,
          presentClasses: 1,
          absentClasses: 1,
          lateClasses: 1,
          attendancePercentage: { $round: ['$attendancePercentage', 2] }
        }
      },
      { $sort: { attendancePercentage: -1 } }
    ]);

    res.json({
      success: true,
      count: stats.length,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching attendance statistics',
      error: error.message
    });
  }
});

// @route   POST /api/attendance
// @desc    Mark attendance
// @access  Private (Teacher/Admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { student, subject, date, status, branch, semester, remarks } = req.body;

    // Validate required fields
    if (!student || !subject || !status || !branch || !semester) {
      return res.status(400).json({
        success: false,
        message: 'Student, subject, status, branch, and semester are required'
      });
    }

    // Get student details
    const studentUser = await User.findById(student);
    if (!studentUser || studentUser.role !== 'student') {
      return res.status(404).json({
        success: false,
        message: 'Student not found'
      });
    }

    // Check if attendance already exists for this date
    const attendanceDate = date ? new Date(date) : new Date();
    const existingAttendance = await Attendance.findOne({
      student,
      subject,
      date: {
        $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
        $lt: new Date(attendanceDate.setHours(23, 59, 59, 999))
      }
    });

    if (existingAttendance) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student and subject today'
      });
    }

    const attendance = new Attendance({
      student,
      studentName: studentUser.name,
      rollNumber: studentUser.rollNumber,
      subject,
      teacher: req.user._id,
      teacherName: req.user.name,
      date: attendanceDate,
      status,
      branch,
      semester,
      remarks,
      markedBy: req.user._id
    });

    await attendance.save();
    await attendance.populate('student', 'name rollNumber');

    res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      data: attendance
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already marked for this student and subject today'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while marking attendance',
      error: error.message
    });
  }
});

// @route   POST /api/attendance/bulk
// @desc    Mark attendance for multiple students
// @access  Private (Teacher/Admin only)
router.post('/bulk', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { attendanceList, subject, date, branch, semester } = req.body;

    if (!attendanceList || !Array.isArray(attendanceList) || attendanceList.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Attendance list is required and must be an array'
      });
    }

    const attendanceDate = date ? new Date(date) : new Date();
    const results = [];
    const errors = [];

    for (const item of attendanceList) {
      try {
        const { student, status, remarks } = item;

        // Get student details
        const studentUser = await User.findById(student);
        if (!studentUser || studentUser.role !== 'student') {
          errors.push({ student, error: 'Student not found' });
          continue;
        }

        // Check if attendance already exists
        const existingAttendance = await Attendance.findOne({
          student,
          subject,
          date: {
            $gte: new Date(attendanceDate.setHours(0, 0, 0, 0)),
            $lt: new Date(attendanceDate.setHours(23, 59, 59, 999))
          }
        });

        if (existingAttendance) {
          errors.push({ student, error: 'Attendance already marked' });
          continue;
        }

        const attendance = new Attendance({
          student,
          studentName: studentUser.name,
          rollNumber: studentUser.rollNumber,
          subject,
          teacher: req.user._id,
          teacherName: req.user.name,
          date: attendanceDate,
          status,
          branch,
          semester,
          remarks,
          markedBy: req.user._id
        });

        await attendance.save();
        results.push(attendance);
      } catch (error) {
        errors.push({ student: item.student, error: error.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Attendance marked for ${results.length} students`,
      data: {
        successful: results.length,
        failed: errors.length,
        results,
        errors
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while marking bulk attendance',
      error: error.message
    });
  }
});

// @route   PUT /api/attendance/:id
// @desc    Update attendance record
// @access  Private (Teacher/Admin only)
router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    // Check if user can edit this record
    if (req.user.role === 'teacher' && attendance.teacher.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own attendance records'
      });
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      data: attendance
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating attendance',
      error: error.message
    });
  }
});

// @route   DELETE /api/attendance/:id
// @desc    Delete attendance record
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }

    await Attendance.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Attendance record deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting attendance',
      error: error.message
    });
  }
});

module.exports = router;