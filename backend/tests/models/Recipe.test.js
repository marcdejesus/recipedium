const mongoose = require('mongoose');
const Recipe = require('../../src/models/Recipe');
const User = require('../../src/models/User');
const dbHandler = require('../setup');

// Connect to a test database before running any tests
beforeAll(async () => await dbHandler.setUp());

// Clear all data after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests have run
afterAll(async () => await dbHandler.tearDown());

describe('Recipe Model Test', () => {
  let testUserId;

  beforeEach(async () => {
    // Create a test user for recipe association
    const user = new User({
      name: 'Recipe Creator',
      email: 'recipe@example.com',
      password: 'password123'
    });
    const savedUser = await user.save();
    testUserId = savedUser._id;
  });

  it('should create & save recipe successfully', async () => {
    const recipeData = {
      title: 'Test Recipe',
      description: 'A delicious test recipe',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
      cookingTime: 30,
      servings: 4,
      difficulty: 'Medium',
      category: 'Dinner',
      user: testUserId
    };
    
    const validRecipe = new Recipe(recipeData);
    const savedRecipe = await validRecipe.save();

    // Object Id should be defined when successfully saved to MongoDB
    expect(savedRecipe._id).toBeDefined();
    expect(savedRecipe.title).toBe(recipeData.title);
    expect(savedRecipe.description).toBe(recipeData.description);
    expect(savedRecipe.ingredients).toHaveLength(2);
    expect(savedRecipe.instructions).toHaveLength(2);
    expect(savedRecipe.cookingTime).toBe(recipeData.cookingTime);
    expect(savedRecipe.servings).toBe(recipeData.servings);
    expect(savedRecipe.difficulty).toBe(recipeData.difficulty);
    expect(savedRecipe.category).toBe(recipeData.category);
    expect(savedRecipe.user.toString()).toBe(testUserId.toString());
    expect(savedRecipe.likes).toHaveLength(0);
    expect(savedRecipe.comments).toHaveLength(0);
    expect(savedRecipe.likesCount).toBe(0);
    expect(savedRecipe.commentsCount).toBe(0);
    expect(savedRecipe.createdAt).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    // Create recipe without required title field
    const recipeWithoutTitle = new Recipe({
      description: 'Recipe with missing title',
      ingredients: ['Ingredient 1', 'Ingredient 2'],
      instructions: ['Step 1', 'Step 2'],
      cookingTime: 30,
      servings: 4,
      difficulty: 'Easy',
      user: testUserId
    });

    // Validation should throw an error
    let err;
    try {
      await recipeWithoutTitle.validate();
    } catch (error) {
      err = error;
    }

    // Verify error exists and has title error
    expect(err).toBeDefined();
    expect(err.errors.title).toBeDefined();
    expect(err.errors.title.kind).toBe('required');
  });

  it('should add a like to the recipe', async () => {
    const recipe = new Recipe({
      title: 'Like Test Recipe',
      description: 'Testing likes functionality',
      ingredients: ['Ingredient 1'],
      instructions: ['Step 1'],
      cookingTime: 15,
      servings: 2,
      difficulty: 'Easy',
      category: 'Dessert',
      user: testUserId
    });
    
    await recipe.save();
    
    // Add a like
    recipe.likes.push({ user: testUserId });
    recipe.likesCount = recipe.likes.length;
    await recipe.save();
    
    expect(recipe.likes).toHaveLength(1);
    expect(recipe.likesCount).toBe(1);
    expect(recipe.likes[0].user.toString()).toBe(testUserId.toString());
  });

  it('should add a comment to the recipe', async () => {
    const recipe = new Recipe({
      title: 'Comment Test Recipe',
      description: 'Testing comments functionality',
      ingredients: ['Ingredient 1'],
      instructions: ['Step 1'],
      cookingTime: 15,
      servings: 2,
      difficulty: 'Easy',
      category: 'Breakfast',
      user: testUserId
    });
    
    await recipe.save();
    
    // Add a comment
    recipe.comments.push({
      user: testUserId,
      text: 'This is a test comment',
      rating: 4
    });
    await recipe.save();
    
    expect(recipe.comments).toHaveLength(1);
    expect(recipe.commentsCount).toBe(1);
    expect(recipe.comments[0].user.toString()).toBe(testUserId.toString());
    expect(recipe.comments[0].text).toBe('This is a test comment');
    expect(recipe.comments[0].rating).toBe(4);
  });

  it('should validate difficulty enum values', async () => {
    const recipeWithInvalidDifficulty = new Recipe({
      title: 'Invalid Difficulty Recipe',
      description: 'Testing difficulty validation',
      ingredients: ['Ingredient 1'],
      instructions: ['Step 1'],
      cookingTime: 15,
      servings: 2,
      difficulty: 'Invalid', // Not a valid enum value
      category: 'Snack',
      user: testUserId
    });

    let err;
    try {
      await recipeWithInvalidDifficulty.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.difficulty).toBeDefined();
  });
}); 