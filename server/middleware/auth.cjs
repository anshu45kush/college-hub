const jwt = require('jsonwebtoken');
const User = require('../models/User.cjs');

// Verify JWT token
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'Access denied. No token provided.' 
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user || !user.isActive) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token or user not found.' 
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid token.' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        success: false, 
        message: 'Token expired.' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Server error during authentication.' 
    });
  }
};

// Check user roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Authentication required.' 
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required role: ${roles.join(' or ')}` 
      });
    }

    next();
  };
};

// Check if user can access specific branch/semester data
const checkBranchAccess = (req, res, next) => {
  const { branch, semester } = req.query;
  
  // Admin can access all data
  if (req.user.role === 'admin') {
    return next();
  }
  
  // Students can only access their own branch/semester
  if (req.user.role === 'student') {
    if (branch && branch !== req.user.branch) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your branch data.' 
      });
    }
    if (semester && parseInt(semester) !== req.user.semester) {
      return res.status(403).json({ 
        success: false, 
        message: 'Access denied. You can only view your semester data.' 
      });
    }
  }
  
  // Teachers can access all branches they teach
  next();
};

module.exports = {
  authenticate,
  authorize,
  checkBranchAccess
};