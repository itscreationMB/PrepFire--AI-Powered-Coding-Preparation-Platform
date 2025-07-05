const jwt = require('jsonwebtoken');
const rateLimit = require('express-rate-limit');
const User = require('./models/User');
const { validateRegistrationData, validateLoginData, validateSubmissionData, validateProblemData } = require('./utils/validation');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId).select('-password');
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. User not found.'
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Account has been deactivated.'
        });
      }

      req.user = user;
      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied. Admin privileges required.'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(403).json({
      success: false,
      message: 'Admin access required'
    });
  }
};

const moderatorAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user && !['admin', 'moderator'].includes(req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'Moderator access required'
        });
      }
      next();
    });
  } catch (error) {
    console.error('Moderator auth middleware error:', error);
    res.status(403).json({
      success: false,
      message: 'Moderator access required'
    });
  }
};

const validateRegistration = (req, res, next) => {
  const validation = validateRegistrationData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const validation = validateLoginData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
};

const validateProblemSubmission = (req, res, next) => {
  const validation = validateSubmissionData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
};

const validateProblemCreation = (req, res, next) => {
  const validation = validateProblemData(req.body);
  
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: validation.errors
    });
  }
  
  next();
};

const validateProfileUpdate = (req, res, next) => {
  const allowedFields = ['name', 'profile', 'preferences'];
  const updates = Object.keys(req.body);
  const isValidUpdate = updates.every(field => allowedFields.includes(field));

  if (!isValidUpdate) {
    return res.status(400).json({
      success: false,
      message: 'Invalid fields in update'
    });
  }

  const { name } = req.body;
  if (name && (name.length < 2 || name.length > 50)) {
    return res.status(400).json({
      success: false,
      message: 'Name must be between 2 and 50 characters'
    });
  }

  next();
};

const validatePasswordChange = (req, res, next) => {
  const { currentPassword, newPassword } = req.body;
  const errors = [];

  if (!currentPassword) {
    errors.push('Current password is required');
  }

  if (!newPassword || newPassword.length < 6) {
    errors.push('New password must be at least 6 characters long');
  }

  if (newPassword && newPassword.length > 128) {
    errors.push('New password must be less than 128 characters');
  }

  if (currentPassword === newPassword) {
    errors.push('New password must be different from current password');
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors
    });
  }

  next();
};

const validatePagination = (req, res, next) => {
  const { page, limit } = req.query;

  if (page && (isNaN(page) || parseInt(page) < 1)) {
    req.query.page = 1;
  }

  if (limit && (isNaN(limit) || parseInt(limit) < 1 || parseInt(limit) > 100)) {
    req.query.limit = 20;
  }

  next();
};

const sanitizeInput = (req, res, next) => {
  const sanitizeObject = (obj) => {
    for (let key in obj) {
      if (typeof obj[key] === 'string') {
        obj[key] = obj[key].trim();
        obj[key] = obj[key].replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    }
  };

  if (req.body) sanitizeObject(req.body);
  if (req.query) sanitizeObject(req.query);
  if (req.params) sanitizeObject(req.params);

  next();
};

const createRateLimit = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      message
    },
    standardHeaders: true,
    legacyHeaders: false
  });
};

const generalLimiter = createRateLimit(
  15 * 60 * 1000,
  1000,
  'Too many requests from this IP, please try again later'
);

const authLimiter = createRateLimit(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts, please try again later'
);

const submissionLimiter = createRateLimit(
  60 * 1000,
  30,
  'Too many submissions, please wait before submitting again'
);

const apiLimiter = createRateLimit(
  15 * 60 * 1000,
  500,
  'Too many API requests, please try again later'
);

const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', err);

  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors
    });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return res.status(400).json({
      success: false,
      message: `${field} already exists`
    });
  }

  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
};

const notFound = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
};

module.exports = {
  auth,
  adminAuth,
  moderatorAuth,
  validateRegistration,
  validateLogin,
  validateProblemSubmission,
  validateProblemCreation,
  validateProfileUpdate,
  validatePasswordChange,
  validatePagination,
  sanitizeInput,
  generalLimiter,
  authLimiter,
  submissionLimiter,
  apiLimiter,
  errorHandler,
  notFound
};