const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes
exports.protect = async (req, res, next) => {
  let token;

  // Get token from header
  if (
    req.headers.authorization && 
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  } else if (req.headers['x-auth-token']) {
    // Set token from x-auth-token header (used in tests)
    token = req.headers['x-auth-token'];
  }

  // Check if token exists
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'testjwtsecret123456789');

    // Add user to request object
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      return res.status(401).json({ msg: 'Token is not valid' });
    }

    next();
  } catch (err) {
    console.error('Token error:', err.message);
    return res.status(401).json({ msg: 'Token is not valid' });
  }
};

// Grant access to specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ msg: 'Not authorized' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        msg: `User role ${req.user.role} is not authorized to access this route`
      });
    }
    next();
  };
};

// Admin access middleware
exports.admin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ msg: 'Not authorized' });
  }
  
  if (req.user.role !== 'admin') {
    return res.status(403).json({ msg: 'Not authorized as an admin' });
  }
  
  next();
}; 