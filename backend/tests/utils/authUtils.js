const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

/**
 * Generate a JWT token for testing purposes
 * @param {Object} payload - The data to include in the token 
 * @returns {String} The signed JWT token
 */
exports.generateToken = (payload) => {
  return jwt.sign(
    payload,
    process.env.JWT_SECRET || 'testjwtsecret123456789', 
    { expiresIn: '1h' }
  );
};

/**
 * Create a mock user ID for testing
 * @returns {String} A valid MongoDB ObjectId as string
 */
exports.createMockUserId = () => {
  return new mongoose.Types.ObjectId().toString();
};

/**
 * Generate an auth token for a user with specified role
 * @param {String} userId - The user ID to include in the token
 * @param {String} role - The user role ('user' or 'admin')
 * @returns {String} The authorization header value with Bearer token
 */
exports.getAuthHeader = (userId, role = 'user') => {
  const token = exports.generateToken({ id: userId, role });
  return `Bearer ${token}`;
}; 