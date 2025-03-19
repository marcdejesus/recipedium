const express = require('express');
const { body, param, validationResult } = require('express-validator');
const User = require('../models/User');
const router = express.Router();
const bcryptjs = require('bcryptjs');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/users/:id
 * @desc    Get user profile by ID
 * @access  Public
 */
router.get(
  '/:id', 
  [param('id').isMongoId().withMessage('Invalid user ID format')],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.params.id)
        .select('-password -__v');
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }

      res.json(user);
    } catch (err) {
      console.error('Error getting user profile:', err.message);
      res.status(500).json({ msg: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private/Admin
 */
router.get('/', auth.protect, auth.admin, async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/:id',
  [
    auth.protect,
    param('id').isMongoId().withMessage('Invalid user ID format'),
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('email').optional().isEmail().withMessage('Please include a valid email'),
    body('bio').optional().isLength({ min: 2 }).withMessage('Bio must be at least 2 characters'),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.id;
      // Check if user exists
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Only allow update if user is the owner or an admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to update this profile' });
      }

      // Build user update object
      const { name, email, bio, password } = req.body;
      
      const userFields = {};
      if (name) userFields.name = name;
      if (email) userFields.email = email;
      if (bio) userFields.bio = bio;
      if (password) {
        // Hash password
        const salt = await bcryptjs.genSalt(10);
        userFields.password = await bcryptjs.hash(password, salt);
      }
      
      // Update user
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: userFields },
        { new: true, runValidators: true }
      ).select('-password');
      
      res.json(updatedUser);
    } catch (err) {
      console.error('Error updating user profile:', err.message);
      
      // Check for duplicate email error
      if (err.code === 11000) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

module.exports = router; 