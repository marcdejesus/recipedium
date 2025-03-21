const Recipe = require('../models/Recipe');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const mongoose = require('mongoose');

// @desc    Get all recipes
// @route   GET /api/recipes
// @access  Public
exports.getRecipes = async (req, res) => {
  try {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query };

    // Fields to exclude
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Loop over removeFields and delete them from reqQuery
    removeFields.forEach(param => delete reqQuery[param]);

    // Create query string
    let queryStr = JSON.stringify(reqQuery);

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Finding resource
    query = Recipe.find(JSON.parse(queryStr)).populate({
      path: 'user',
      select: 'name'
    });

    // Select Fields
    if (req.query.select) {
      const fields = req.query.select.split(',').join(' ');
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Recipe.countDocuments(JSON.parse(queryStr));

    query = query.skip(startIndex).limit(limit);

    // Executing query
    const allRecipes = await query;

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit
      };
    }

    res.status(200).json({
      count: allRecipes.length,
      pagination,
      recipes: allRecipes
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get a single recipe
// @route   GET /api/recipes/:id
// @access  Public
exports.getRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate('user', 'name profileImage bio createdAt')
      .populate({
        path: 'comments.user',
        select: 'name profileImage createdAt'
      });

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err.message);
    
    // Check if error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Create a new recipe
// @route   POST /api/recipes
// @access  Private
exports.createRecipe = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Add user to req.body
    req.body.user = req.user.id;

    const recipe = await Recipe.create(req.body);

    res.status(201).json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Update a recipe
// @route   PUT /api/recipes/:id
// @access  Private
exports.updateRecipe = async (req, res) => {
  try {
    let recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Make sure user owns the recipe
    if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'Not authorized to update this recipe' });
    }

    recipe = await Recipe.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ errors: messages });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete a recipe
// @route   DELETE /api/recipes/:id
// @access  Private
exports.deleteRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Check if recipe belongs to user
    if (recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({ msg: 'Not authorized to delete this recipe' });
    }

    await recipe.deleteOne();

    res.status(200).json({ msg: 'Recipe removed' });
  } catch (err) {
    console.error(err.message);
    
    // Check if error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Like a recipe
// @route   POST /api/recipes/:id/like
// @access  Private
exports.likeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Check if the recipe has already been liked by this user
    if (recipe.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Recipe already liked' });
    }

    recipe.likes.unshift({ user: req.user.id });
    
    await recipe.save();

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Unlike a recipe
// @route   DELETE /api/recipes/:id/like
// @access  Private
exports.unlikeRecipe = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Check if recipe hasn't yet been liked by this user
    if (!recipe.likes.some(like => like.user.toString() === req.user.id)) {
      return res.status(400).json({ msg: 'Recipe has not yet been liked' });
    }

    // Remove the like
    recipe.likes = recipe.likes.filter(like => like.user.toString() !== req.user.id);
    
    await recipe.save();

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Add comment to recipe
// @route   POST /api/recipes/:id/comments
// @access  Private
exports.addComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    const { text, rating } = req.body;

    if (!text) {
      return res.status(400).json({ msg: 'Text is required' });
    }

    const newComment = {
      text,
      rating: rating || 5,
      user: req.user.id
    };

    recipe.comments.unshift(newComment);
    
    await recipe.save();

    // Populate the new comment with user info
    const populatedRecipe = await Recipe.findById(req.params.id).populate({
      path: 'comments.user',
      select: 'name'
    });

    res.status(201).json(populatedRecipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Delete comment
// @route   DELETE /api/recipes/:id/comments/:comment_id
// @access  Private
exports.deleteComment = async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);

    if (!recipe) {
      return res.status(404).json({ msg: 'Recipe not found' });
    }

    // Pull out comment
    const comment = recipe.comments.find(comment => comment.id === req.params.comment_id);

    // Make sure comment exists
    if (!comment) {
      return res.status(404).json({ msg: 'Comment not found' });
    }

    // Check user is comment author or recipe owner
    if (comment.user.toString() !== req.user.id && recipe.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ msg: 'User not authorized' });
    }

    // Get remove index
    recipe.comments = recipe.comments.filter(comment => comment.id !== req.params.comment_id);
    
    await recipe.save();

    res.status(200).json(recipe);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Recipe not found' });
    }
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get user's recipes
// @route   GET /api/recipes/user/:userId
// @access  Public
exports.getUserRecipes = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    
    // Calculate pagination
    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    // First, check if the user exists
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Find recipes with populated user data
    const recipes = await Recipe.find({ user: req.params.userId })
      .populate('user', 'name profileImage bio createdAt') // Populate with all needed user fields
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Recipe.countDocuments({ user: req.params.userId });

    // Log response data for debugging
    console.log(`Found ${recipes.length} recipes for user ${req.params.userId}`);
    
    // User info to include if no recipes found
    const userInfo = {
      _id: user._id,
      name: user.name,
      profileImage: user.profileImage,
      bio: user.bio,
      createdAt: user.createdAt
    };
    
    // Include user info in the response
    res.status(200).json({
      success: true,
      count: recipes.length,
      total,
      pagination: {
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      },
      data: recipes,
      // Include user data separately so frontend has access to it even when no recipes are found
      userData: userInfo
    });
  } catch (err) {
    console.error(err.message);
    
    // Check if error is due to invalid ID format
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.status(500).json({ msg: 'Server Error' });
  }
};

// @desc    Get recipes liked by the current user
// @route   GET /api/recipes/liked
// @access  Private
exports.getLikedRecipes = async (req, res) => {
  try {
    console.log('Fetching liked recipes for user ID:', req.user.id);
    console.log('Query params:', req.query);
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Build query to find recipes that the current user has liked
    // The key is to correctly match against the likes array
    const query = {
      'likes.user': req.user.id
    };
    console.log('User ID for likes query:', req.user.id);
    
    // Add additional filters if provided
    if (req.query.category && req.query.category !== 'all') {
      query.category = req.query.category.toLowerCase();
    }
    
    if (req.query.diet && req.query.diet !== 'all') {
      query.diet = req.query.diet.toLowerCase();
    }
    
    // Text search - use $text if available or regex as fallback
    if (req.query.search && req.query.search.trim() !== '') {
      query.$or = [
        { title: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }
    
    console.log('Constructed query:', JSON.stringify(query));
    
    // Determine sort order
    let sortQuery = { createdAt: -1 }; // Default sort by newest
    
    if (req.query.sort) {
      const sortParam = req.query.sort.toString();
      if (sortParam === '-createdAt') sortQuery = { createdAt: -1 };
      else if (sortParam === 'createdAt') sortQuery = { createdAt: 1 };
      else if (sortParam === '-likesCount') sortQuery = { likes: -1 };
      else if (sortParam === '-commentsCount') sortQuery = { 'comments.length': -1 };
    }
    
    console.log('Sort query:', JSON.stringify(sortQuery));
    
    // First get a sample recipe to check the structure
    const sampleRecipe = await Recipe.findOne({
      'likes.user': req.user.id
    });
    
    if (sampleRecipe) {
      console.log('Sample liked recipe found:', sampleRecipe._id);
      console.log('Sample recipe likes:', sampleRecipe.likes);
    } else {
      console.log('No sample liked recipe found for user');
    }
    
    // Execute query with pagination
    const recipes = await Recipe.find(query)
      .populate('user', 'name profileImage')
      .sort(sortQuery)
      .skip(skip)
      .limit(limit);
    
    console.log(`Found ${recipes.length} liked recipes`);
    
    if (recipes.length > 0) {
      // Log first recipe for debugging
      console.log('First recipe id:', recipes[0]._id);
      console.log('First recipe likes:', recipes[0].likes);
    }
    
    // Get total count for pagination
    const total = await Recipe.countDocuments(query);
    
    res.json({
      recipes,
      count: total,
      pagination: {
        page,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('Error in getLikedRecipes:', err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
}; 