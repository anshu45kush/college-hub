const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');
const { authenticate } = require('../middleware/auth.cjs');

const router = express.Router();

// Generate JWT token
const generateToken = (userId) => {
  // Ensure JWT_EXPIRES_IN is a string that jwt can understand
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d'; // fallback 1 day
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: String(expiresIn) });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
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

    const userData = { name, email, password, role };

    // Role-specific fields
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

    // Create user
    const user = new User(userData);
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { user, token }
    });
  } catch (error) {
    if (error.code === 11000) {
      const field = Object.keys(error.keyValue)[0];
      return res.status(400).json({ success: false, message: `${field} already exists` });
    }

    res.status(500).json({ success: false, message: 'Server error during registration', error: error.message });
  }
});

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (!user.isActive) {
      return res.status(401).json({ success: false, message: 'Account is deactivated. Please contact administrator.' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    user.password = undefined;

    res.json({ success: true, message: 'Login successful', data: { user, token } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error during login', error: error.message });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user profile
// @access  Private
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({ success: true, data: { user: req.user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', authenticate, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (email) user.email = email;

    await user.save();

    res.json({ success: true, message: 'Profile updated successfully', data: { user } });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    res.status(500).json({ success: false, message: 'Server error during profile update', error: error.message });
  }
});

module.exports = router;
