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
    body('bio').optional().custom((value) => {
      // If bio is empty string, set it to null or undefined
      if (value === '') {
        return true;
      }
      // Only validate length if bio exists and is not empty
      if (value && value.length < 2) {
        throw new Error('Bio must be at least 2 characters');
      }
      return true;
    }),
    body('profileImage').optional(),
    body('password').optional().isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors in user update:', errors.array());
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.id;
      
      // Log request for debugging (redacting sensitive info)
      console.log(`Profile update request for user ${userId}:`, {
        ...req.body,
        profileImage: req.body.profileImage ? 
          `[Image string of length ${req.body.profileImage.length}]` : null,
        password: req.body.password ? '[REDACTED]' : undefined
      });
      
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
      const { name, email, bio, password, profileImage } = req.body;
      
      const userFields = {};
      if (name) userFields.name = name;
      if (email) userFields.email = email;
      if (bio) userFields.bio = bio;
      if (profileImage !== undefined) {
        // Validate profile image size if it's a base64 string
        if (profileImage && profileImage.startsWith('data:image')) {
          // Check if image string is too large (over 2MB after encoding)
          if (profileImage.length > 2 * 1024 * 1024) {
            return res.status(400).json({ 
              msg: 'Profile image is too large. Please upload a smaller image.' 
            });
          }
        }
        userFields.profileImage = profileImage;
      }
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
      
      console.log(`User ${userId} profile updated successfully`);
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

/**
 * @route   PUT /api/users/:id/password
 * @desc    Update user password
 * @access  Private
 */
router.put(
  '/:id/password',
  [
    auth.protect,
    param('id').isMongoId().withMessage('Invalid user ID format'),
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
  ],
  async (req, res) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.id;
      
      // Only allow update if user is the owner
      if (userId !== req.user.id) {
        return res.status(403).json({ msg: 'Not authorized to update this password' });
      }
      
      // Get user with password
      const user = await User.findById(userId).select('+password');
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Verify current password
      const { currentPassword, newPassword } = req.body;
      
      const isMatch = await user.matchPassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({ msg: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save(); // This will trigger the pre-save hook to hash the password
      
      res.json({ msg: 'Password updated successfully' });
    } catch (err) {
      console.error('Error updating password:', err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

/**
 * @route   DELETE /api/users/:id
 * @desc    Delete user account
 * @access  Private
 */
router.delete(
  '/:id',
  [
    auth.protect,
    param('id').isMongoId().withMessage('Invalid user ID format')
  ],
  async (req, res) => {
    try {
      const userId = req.params.id;
      
      // Only allow deletion if user is the owner or an admin
      if (userId !== req.user.id && req.user.role !== 'admin') {
        return res.status(403).json({ msg: 'Not authorized to delete this account' });
      }
      
      // Get user
      const user = await User.findById(userId);
      
      if (!user) {
        return res.status(404).json({ msg: 'User not found' });
      }
      
      // Delete user
      await User.findByIdAndDelete(userId);
      
      // In a production app, you would also:
      // 1. Delete or anonymize user's content (recipes, etc.)
      // 2. Remove user references from other collections
      // 3. Handle cascading deletions
      
      res.json({ msg: 'User account deleted successfully' });
    } catch (err) {
      console.error('Error deleting user account:', err.message);
      res.status(500).json({ msg: 'Server Error' });
    }
  }
);

module.exports = router; 