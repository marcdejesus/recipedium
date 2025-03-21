const express = require('express');
const { body } = require('express-validator');
const { 
  getRecipes, 
  getRecipe, 
  createRecipe, 
  updateRecipe, 
  deleteRecipe,
  likeRecipe,
  unlikeRecipe,
  addComment,
  deleteComment,
  getUserRecipes,
  getLikedRecipes
} = require('../controllers/recipe');
const { protect } = require('../middleware/auth');

const router = express.Router();

// IMPORTANT: Put specific routes before parametrized routes to avoid conflicts
// Routes with specific paths
// Get liked recipes - must be before /:id routes to prevent conflict
router.route('/liked')
  .get(protect, getLikedRecipes);

// Get recipes by user
router.route('/user/:userId')
  .get(getUserRecipes);

// Get all recipes & create a new recipe
router.route('/')
  .get(getRecipes)
  .post(
    protect,
    [
      body('title', 'Title is required').not().isEmpty(),
      body('description', 'Description is required').not().isEmpty(),
      body('ingredients', 'Ingredients are required').isArray().not().isEmpty(),
      body('instructions', 'Instructions are required').isArray().not().isEmpty(),
      body('cookingTime', 'Cooking time is required').isNumeric(),
      body('servings', 'Number of servings is required').isNumeric(),
      body('category', 'Category is required').not().isEmpty()
    ],
    createRecipe
  );

// Get, update, and delete a specific recipe
router.route('/:id')
  .get(getRecipe)
  .put(protect, updateRecipe)
  .delete(protect, deleteRecipe);

// Like and unlike a recipe
router.route('/:id/like')
  .post(protect, likeRecipe)
  .delete(protect, unlikeRecipe);

// Comment on a recipe
router.route('/:id/comments')
  .post(
    protect,
    [
      body('text', 'Text is required').not().isEmpty()
    ],
    addComment
  );

// Delete a comment
router.route('/:id/comments/:comment_id')
  .delete(protect, deleteComment);

module.exports = router; 