const express = require('express');
const Timetable = require('../models/Timetable.cjs');
const { authenticate, authorize, checkBranchAccess } = require('../middleware/auth.cjs');

const router = express.Router();

// @route   GET /api/timetable
// @desc    Get timetables with filtering
// @access  Private
router.get('/', authenticate, checkBranchAccess, async (req, res) => {
  try {
    const { branch, semester, day, teacher } = req.query;
    let filter = { isActive: true };

    // Build filter based on user role and query params
    if (req.user.role === 'student') {
      filter.branch = req.user.branch;
      filter.semester = req.user.semester;
    } else {
      if (branch) filter.branch = branch;
      if (semester) filter.semester = parseInt(semester);
    }

    if (day) filter.day = day;
    if (teacher) filter.teacher = teacher;

    const timetables = await Timetable.find(filter)
      .populate('teacher', 'name employeeId')
      .populate('createdBy', 'name')
      .sort({ day: 1, time: 1 });

    res.json({
      success: true,
      count: timetables.length,
      data: timetables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching timetables',
      error: error.message
    });
  }
});

// @route   GET /api/timetable/:id
// @desc    Get single timetable entry
// @access  Private
router.get('/:id', authenticate, async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id)
      .populate('teacher', 'name employeeId')
      .populate('createdBy', 'name');

    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    // Check access permissions
    if (req.user.role === 'student') {
      if (timetable.branch !== req.user.branch || timetable.semester !== req.user.semester) {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }
    }

    res.json({
      success: true,
      data: timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching timetable',
      error: error.message
    });
  }
});

// @route   POST /api/timetable
// @desc    Create new timetable entry
// @access  Private (Teacher/Admin only)
router.post('/', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, teacher, teacherName, time, room, branch, semester, day, type } = req.body;

    // Validate required fields
    if (!subject || !teacher || !teacherName || !time || !room || !branch || !semester || !day) {
      return res.status(400).json({
        success: false,
        message: 'All required fields must be provided'
      });
    }

    // Check for time conflicts
    const existingEntry = await Timetable.findOne({
      branch,
      semester,
      day,
      time,
      room,
      isActive: true
    });

    if (existingEntry) {
      return res.status(400).json({
        success: false,
        message: 'Time slot conflict: Room is already booked for this time'
      });
    }

    const timetable = new Timetable({
      subject,
      teacher,
      teacherName,
      time,
      room,
      branch,
      semester,
      day,
      type: type || 'theory',
      createdBy: req.user._id
    });

    await timetable.save();
    await timetable.populate('teacher', 'name employeeId');

    res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully',
      data: timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while creating timetable',
      error: error.message
    });
  }
});

// @route   PUT /api/timetable/:id
// @desc    Update timetable entry
// @access  Private (Teacher/Admin only)
router.put('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { subject, teacher, teacherName, time, room, branch, semester, day, type } = req.body;

    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    // Check if user can edit this entry
    if (req.user.role === 'teacher' && timetable.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only edit your own timetable entries'
      });
    }

    // Check for time conflicts (excluding current entry)
    if (time && room && day) {
      const existingEntry = await Timetable.findOne({
        _id: { $ne: req.params.id },
        branch: branch || timetable.branch,
        semester: semester || timetable.semester,
        day: day || timetable.day,
        time: time || timetable.time,
        room: room || timetable.room,
        isActive: true
      });

      if (existingEntry) {
        return res.status(400).json({
          success: false,
          message: 'Time slot conflict: Room is already booked for this time'
        });
      }
    }

    // Update fields
    if (subject) timetable.subject = subject;
    if (teacher) timetable.teacher = teacher;
    if (teacherName) timetable.teacherName = teacherName;
    if (time) timetable.time = time;
    if (room) timetable.room = room;
    if (branch) timetable.branch = branch;
    if (semester) timetable.semester = semester;
    if (day) timetable.day = day;
    if (type) timetable.type = type;

    await timetable.save();
    await timetable.populate('teacher', 'name employeeId');

    res.json({
      success: true,
      message: 'Timetable entry updated successfully',
      data: timetable
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while updating timetable',
      error: error.message
    });
  }
});

// @route   DELETE /api/timetable/:id
// @desc    Delete timetable entry (soft delete)
// @access  Private (Teacher/Admin only)
router.delete('/:id', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const timetable = await Timetable.findById(req.params.id);
    if (!timetable) {
      return res.status(404).json({
        success: false,
        message: 'Timetable entry not found'
      });
    }

    // Check if user can delete this entry
    if (req.user.role === 'teacher' && timetable.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own timetable entries'
      });
    }

    // Soft delete
    timetable.isActive = false;
    await timetable.save();

    res.json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting timetable',
      error: error.message
    });
  }
});

module.exports = router;