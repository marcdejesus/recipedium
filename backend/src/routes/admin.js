const express = require('express');
const router = express.Router();
const {
  getUsers,
  promoteUser,
  demoteUser,
  banUser,
  getAnalytics,
  getReportedRecipes,
  approveReport,
  rejectReport
} = require('../controllers/admin');
const { protect, admin } = require('../middleware/auth');

// All routes in this file are protected with both auth & admin middleware
router.use(protect, admin);

// User management routes
router.route('/users')
  .get(getUsers);

router.route('/users/:id/promote')
  .put(promoteUser);

router.route('/users/:id/demote')
  .put(demoteUser);

router.route('/users/:id/ban')
  .put(banUser);

// Analytics
router.route('/analytics')
  .get(getAnalytics);

// Reported recipes
router.route('/reported-recipes')
  .get(getReportedRecipes);

router.route('/reported-recipes/:id/approve')
  .put(approveReport);

router.route('/reported-recipes/:id/reject')
  .put(rejectReport);

module.exports = router; 