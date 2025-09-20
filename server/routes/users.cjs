const express = require('express');
const User = require('../models/User.cjs');
const { authenticate, authorize } = require('../middleware/auth.cjs');

const router = express.Router();

// @route   GET /api/users
// @desc    Get all users with filtering
// @access  Private (Admin only)
router.get('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { role, branch, semester, isActive, search } = req.query;
    let filter = {};

    // Build filter
    if (role) filter.role = role;
    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);
    if (isActive !== undefined) filter.isActive = isActive === 'true';

    // Search functionality
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      count: users.length,
      data: users
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users',
      error: error.message
    });
  }
});

// @route   GET /api/users/students
// @desc    Get all students
// @access  Private (Teacher/Admin only)
router.get('/students', authenticate, authorize('teacher', 'admin'), async (req, res) => {
  try {
    const { branch, semester } = req.query;
    let filter = { role: 'student', isActive: true };

    if (branch) filter.branch = branch;
    if (semester) filter.semester = parseInt(semester);

    const students = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: students.length,
      data: students
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching students',
      error: error.message
    });
  }
});

// @route   GET /api/users/teachers
// @desc    Get all teachers
// @access  Private (Admin only)
router.get('/teachers', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { department } = req.query;
    let filter = { role: 'teacher', isActive: true };

    if (department) filter.department = department;

    const teachers = await User.find(filter)
      .select('-password')
      .sort({ name: 1 });

    res.json({
      success: true,
      count: teachers.length,
      data: teachers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching teachers',
      error: error.message
    });
  }
});

// @route   GET /api/users/:id
// @desc    Get single user
// @access  Private (Admin only or own profile)
router.get('/:id', authenticate, async (req, res) => {
  try {
    // Allow users to view their own profile or admin to view any profile
    if (req.user.role !== 'admin' && req.user._id.toString() !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user',
      error: error.message
    });
  }
});

// @route   POST /api/users
// @desc    Create new user
// @access  Private (Admin only)
router.post('/', authenticate, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, branch, semester, rollNumber, employeeId, department } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User with this email already exists'
      });
    }

    // Create user data object
    const userData = { name, email, password, role };

    // Add role-specific fields
    if (role === 'student') {
      if (!branch || !semester || !rollNumber) {
        return res.status(400).json({
          success: false,
          message: 'Branch, semester, and roll number are required for students'
        });
      }
      userData.branch = branch;
      userData.semester = semester;
      userData.rollNumber = rollNumber;
    } else if (role === 'teacher') {
      if (!employeeId || !department) {
        return res.status(400).json({
          success: false,
          message: 'Employee ID and department are required for teachers'
        });
      }
      userData.employeeId = employeeId;
      userData.department = department;
    }

    const user = new User(userData);
    await user.save();

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while creating user',
      error: error.message
    });
  }
});

// @route   PUT /api/users/:id
// @desc    Update user
// @access  Private (Admin only or own profile for basic fields)
router.put('/:id', authenticate, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Check permissions
    const isOwnProfile = req.user._id.toString() === req.params.id;
    const isAdmin = req.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { name, email, role, branch, semester, rollNumber, employeeId, department, isActive } = req.body;

    // Users can only update basic fields on their own profile
    if (isOwnProfile && !isAdmin) {
      if (name) user.name = name;
      if (email) user.email = email;
    } else if (isAdmin) {
      // Admin can update all fields
      if (name) user.name = name;
      if (email) user.email = email;
      if (role) user.role = role;
      if (branch) user.branch = branch;
      if (semester) user.semester = semester;
      if (rollNumber) user.rollNumber = rollNumber;
      if (employeeId) user.employeeId = employeeId;
      if (department) user.department = department;
      if (isActive !== undefined) user.isActive = isActive;
    }

    await user.save();

    res.json({
      success: true,
      message: 'User updated successfully',
      data: user
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({
        success: false,
        message: `${field} already exists`
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error while updating user',
      error: error.message
    });
  }
});

// @route   DELETE /api/users/:id
// @desc    Delete user (soft delete)
// @access  Private (Admin only)
router.delete('/:id', authenticate, authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === req.params.id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account'
      });
    }

    // Soft delete
    user.isActive = false;
    await user.save();

    res.json({
      success: true,
      message: 'User deactivated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while deleting user',
      error: error.message
    });
  }
});

// @route   GET /api/users/stats/overview
// @desc    Get user statistics overview
// @access  Private (Admin only)
router.get('/stats/overview', authenticate, authorize('admin'), async (req, res) => {
  try {
    const stats = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 },
          active: {
            $sum: {
              $cond: [{ $eq: ['$isActive', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    res.json({
      success: true,
      data: {
        totalUsers,
        activeUsers,
        roleStats: stats
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user statistics',
      error: error.message
    });
  }
});

module.exports = router;