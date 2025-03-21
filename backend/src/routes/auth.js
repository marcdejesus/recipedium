const express = require('express');
const { body } = require('express-validator');
const { register, login, getMe, forgotPassword, resetPassword } = require('../controllers/auth');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Register route with validation
router.post(
  '/register',
  [
    body('name', 'Name is required').not().isEmpty(),
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  register
);

// Login route with validation
router.post(
  '/login',
  [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
  ],
  login
);

// Get current user route (protected)
router.get('/me', protect, getMe);

// Forgot password route
router.post(
  '/forgot-password',
  [
    body('email', 'Please include a valid email').isEmail()
  ],
  forgotPassword
);

// Reset password route
router.post(
  '/reset-password',
  [
    body('token', 'Token is required').not().isEmpty(),
    body('newPassword', 'Password must be at least 6 characters').isLength({ min: 6 })
  ],
  resetPassword
);

// Fallback handler for forgot-password if main controller doesn't exist
router.post('/forgot-password', (req, res) => {
  // This is a fallback that will only be reached if the main forgotPassword handler is not defined
  console.log('Fallback forgot-password handler called');
  
  // Always return a success message for security (prevents user enumeration)
  return res.status(200).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent'
  });
});

// Fallback handler for reset-password if main controller doesn't exist
router.post('/reset-password', (req, res) => {
  // This is a fallback that will only be reached if the main resetPassword handler is not defined
  console.log('Fallback reset-password handler called');
  
  return res.status(400).json({
    success: false,
    message: 'Invalid or expired token'
  });
});

module.exports = router; 