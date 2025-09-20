// const express = require('express');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');

// // Load environment variables from server/.env
// require('dotenv').config();

// const connectDB = require('./config/database.cjs');

// // Import routes
// const authRoutes = require('./routes/auth.cjs');
// const userRoutes = require('./routes/users.cjs');
// const timetableRoutes = require('./routes/timetable.cjs');
// const attendanceRoutes = require('./routes/attendance.cjs');

// const app = express();

// // Connect to database
// connectDB();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100, // limit each IP to 100 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many requests from this IP, please try again later.'
//   }
// });
// app.use('/api/', limiter);

// // Stricter rate limiting for auth routes
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 5, // limit each IP to 5 requests per windowMs
//   message: {
//     success: false,
//     message: 'Too many authentication attempts, please try again later.'
//   }
// });
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// // CORS configuration
// app.use(cors({
//   origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//   credentials: true,
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization']
// }));

// // Body parsing middleware
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// // Logging middleware
// if (process.env.NODE_ENV === 'development') {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('combined'));
// }

// // Health check endpoint
// app.get('/health', (req, res) => {
//   res.json({
//     success: true,
//     message: 'College Academic Hub API is running',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV
//   });
// });

// // API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/timetable', timetableRoutes);
// app.use('/api/attendance', attendanceRoutes);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({
//     success: false,
//     message: 'API endpoint not found'
//   });
// });

// // Global error handler
// app.use((error, req, res, next) => {
//   console.error('Error:', error);

//   // Mongoose validation error
//   if (error.name === 'ValidationError') {
//     const errors = Object.values(error.errors).map(err => err.message);
//     return res.status(400).json({
//       success: false,
//       message: 'Validation Error',
//       errors
//     });
//   }

//   // Mongoose cast error
//   if (error.name === 'CastError') {
//     return res.status(400).json({
//       success: false,
//       message: 'Invalid ID format'
//     });
//   }

//   // JWT errors
//   if (error.name === 'JsonWebTokenError') {
//     return res.status(401).json({
//       success: false,
//       message: 'Invalid token'
//     });
//   }

//   if (error.name === 'TokenExpiredError') {
//     return res.status(401).json({
//       success: false,
//       message: 'Token expired'
//     });
//   }

//   // Default error
//   res.status(error.status || 500).json({
//     success: false,
//     message: error.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
//   });
// });

// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV}`);
//   console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
// });

// module.exports = app;

/* server/app.cjs
   Updated: Loads server/.env reliably, debug logs env, connects to MongoDB, preserves routes.
   Make backup before replacing: cp app.cjs app.cjs.bak
*/
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');
// const helmet = require('helmet');
// const morgan = require('morgan');
// const rateLimit = require('express-rate-limit');
// const path = require('path');

// // Load root .env
// require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// // Debug: show loaded env variables
// console.log('DEBUG: Loaded env keys:', Object.keys(process.env));
// console.log('DEBUG: PORT =', process.env.PORT);
// console.log('DEBUG: NODE_ENV =', process.env.NODE_ENV);
// console.log('DEBUG: FRONTEND_URL =', process.env.FRONTEND_URL);
// console.log('DEBUG: MONGO_URI =', process.env.MONGO_URI);

// // Import routes
// const authRoutes = require('./routes/auth.cjs');
// const userRoutes = require('./routes/users.cjs');
// const timetableRoutes = require('./routes/timetable.cjs');
// const attendanceRoutes = require('./routes/attendance.cjs');

// const app = express();

// // Security middleware
// app.use(helmet());

// // Rate limiting
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: { success: false, message: 'Too many requests, please try later.' }
// });
// app.use('/api/', limiter);

// // Stricter rate limiting for auth
// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: { success: false, message: 'Too many auth attempts, try later.' }
// });
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// // Body parser & CORS
// app.use(express.json({ limit: '10mb' }));
// app.use(express.urlencoded({ extended: true, limit: '10mb' }));
// app.use(
//   cors({
//     origin: process.env.FRONTEND_URL || 'http://localhost:5173',
//     credentials: true,
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//     allowedHeaders: ['Content-Type', 'Authorization']
//   })
// );

// // Logging
// if ((process.env.NODE_ENV || 'development') === 'development') {
//   app.use(morgan('dev'));
// } else {
//   app.use(morgan('combined'));
// }

// // Health check
// app.get('/health', (req, res) =>
//   res.json({
//     success: true,
//     message: 'College Academic Hub API is running',
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || 'development'
//   })
// );

// // Mount API routes
// app.use('/api/auth', authRoutes);
// app.use('/api/users', userRoutes);
// app.use('/api/timetable', timetableRoutes);
// app.use('/api/attendance', attendanceRoutes);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ success: false, message: 'API endpoint not found' });
// });

// // Global error handler
// app.use((err, req, res, next) => {
//   console.error('Global Error:', err && err.stack ? err.stack : err);
//   res.status(err.status || 500).json({
//     success: false,
//     message: err.message || 'Internal Server Error',
//     ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
//   });
// });

// // Connect to MongoDB Atlas & start server
// const PORT = parseInt(process.env.PORT, 10) || 5000;
// const MONGO_URI = process.env.MONGO_URI;

// if (!MONGO_URI) {
//   console.error('❌ MONGO_URI is not set in root .env. Aborting startup.');
//   process.exit(1);
// }

// mongoose
//   .connect(MONGO_URI) // No deprecated warnings
//   .then(() => {
//     app.listen(PORT, () => {
//       console.log(`✅ Server running on port ${PORT}`);
//       console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
//       console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
//       console.log('🗄️  Database connected successfully');
//     });
//   })
//   .catch((err) => {
//     console.error('❌ Database connection failed:', err && err.message ? err.message : err);
//     process.exit(1);
//   });

// module.exports = app;

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
// const rateLimit = require('express-rate-limit'); // Not needed if we disable
const path = require('path');

// Load root .env
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

// Debug: show loaded env variables
console.log('DEBUG: Loaded env keys:', Object.keys(process.env));
console.log('DEBUG: PORT =', process.env.PORT);
console.log('DEBUG: NODE_ENV =', process.env.NODE_ENV);
console.log('DEBUG: FRONTEND_URL =', process.env.FRONTEND_URL);
console.log('DEBUG: MONGO_URI =', process.env.MONGO_URI);

// Import routes
const authRoutes = require('./routes/auth.cjs');
const userRoutes = require('./routes/users.cjs');
const timetableRoutes = require('./routes/timetable.cjs');
const attendanceRoutes = require('./routes/attendance.cjs');

const app = express();

// Security middleware
app.use(helmet());

// === RATE LIMITING DISABLED FOR DEV ===
// const limiter = rateLimit({
//   windowMs: 15 * 60 * 1000, // 15 minutes
//   max: 100,
//   message: { success: false, message: 'Too many requests, please try later.' }
// });
// app.use('/api/', limiter);

// const authLimiter = rateLimit({
//   windowMs: 15 * 60 * 1000,
//   max: 5,
//   message: { success: false, message: 'Too many auth attempts, try later.' }
// });
// app.use('/api/auth/login', authLimiter);
// app.use('/api/auth/register', authLimiter);

// Body parser & CORS
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Logging
if ((process.env.NODE_ENV || 'development') === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Health check
app.get('/health', (req, res) =>
  res.json({
    success: true,
    message: 'College Academic Hub API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  })
);

// Mount API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/timetable', timetableRoutes);
app.use('/api/attendance', attendanceRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'API endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global Error:', err && err.stack ? err.stack : err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

// Connect to MongoDB Atlas & start server
const PORT = parseInt(process.env.PORT, 10) || 5000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not set in root .env. Aborting startup.');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
      console.log('🗄️  Database connected successfully');
    });
  })
  .catch((err) => {
    console.error('❌ Database connection failed:', err && err.message ? err.message : err);
    process.exit(1);
  });

module.exports = app;


