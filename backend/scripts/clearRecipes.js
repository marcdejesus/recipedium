const mongoose = require('mongoose');
const path = require('path');

// Import the Recipe model
const Recipe = require('../src/models/Recipe');

// Function to clear all recipes
async function clearRecipes() {
  console.log('Connecting to MongoDB...');
  
  try {
    // Connect to MongoDB - use the correct environment variable
    await mongoose.connect('mongodb://mongodb:27017/recipeshare', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    
    console.log('Connected to MongoDB successfully');
    
    // Delete all recipes
    const result = await Recipe.deleteMany({});
    console.log(`Successfully deleted ${result.deletedCount} recipes from the database`);
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    console.log('Script completed successfully');
  } catch (error) {
    console.error('Error clearing recipes:', error);
    
    // Close MongoDB connection if there's an error
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed after error');
    }
    
    console.error('Script failed:', error);
  }
}

// Run the function
clearRecipes();

module.exports = clearRecipes; 