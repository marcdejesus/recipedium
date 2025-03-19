/**
 * Script to generate random recipes and populate the database
 */

const mongoose = require('mongoose');
const Recipe = require('../src/models/Recipe');
const User = require('../src/models/User');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/recipeshare')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Sample data for generating recipes
const sampleData = {
  titles: [
    'Homemade Margherita Pizza', 'Spicy Thai Curry', 'Classic Caesar Salad', 
    'Chocolate Chip Cookies', 'Beef Stroganoff', 'Veggie Stir Fry',
    'Banana Bread', 'Chicken Alfredo Pasta', 'Fresh Spring Rolls',
    'Mushroom Risotto', 'Apple Pie', 'Beef Tacos', 'Vegetable Soup',
    'Grilled Salmon', 'Eggs Benedict', 'Pancakes', 'Avocado Toast',
    'Sushi Rolls', 'Beef Burger', 'Fried Rice', 'Lasagna', 'Tomato Soup',
    'French Toast', 'Chicken Curry', 'Beef Stew'
  ],
  descriptions: [
    'A delicious homemade recipe that everyone will love.',
    'Perfect for a quick weeknight dinner.',
    'A healthy and nutritious meal for the whole family.',
    'Great for parties and gatherings.',
    'A classic recipe with a modern twist.',
    'Comfort food at its finest.',
    'Easy to make with ingredients you probably already have.',
    'Impressive dish that looks like it took hours to make.',
    'Light and refreshing for summer days.',
    'Hearty and filling for cold winter nights.',
    'A crowd-pleaser that never fails to impress.',
    'Restaurant quality food made in your own kitchen.'
  ],
  ingredients: [
    'Salt', 'Pepper', 'Olive oil', 'Butter', 'Garlic', 'Onion', 
    'Tomatoes', 'Pasta', 'Rice', 'Chicken breast', 'Ground beef', 
    'Eggs', 'Milk', 'Flour', 'Sugar', 'Cheese', 'Bell peppers',
    'Carrots', 'Celery', 'Potatoes', 'Broccoli', 'Spinach',
    'Lemon', 'Lime', 'Soy sauce', 'Honey', 'Mustard', 'Vinegar',
    'Bread', 'Lettuce', 'Mushrooms', 'Avocado', 'Cilantro', 'Basil',
    'Thyme', 'Rosemary', 'Cinnamon', 'Vanilla extract', 'Chocolate chips',
    'Baking powder', 'Baking soda', 'Cream', 'Yogurt', 'Tofu'
  ],
  instructionSteps: [
    'Preheat the oven to 350°F (175°C).',
    'Chop all vegetables into small, even pieces.',
    'Season with salt and pepper to taste.',
    'Heat oil in a large skillet over medium heat.',
    'Cook until golden brown on both sides.',
    'Bring a large pot of salted water to a boil.',
    'Simmer until the sauce has thickened.',
    'Mix all ingredients in a large bowl.',
    'Knead the dough on a floured surface.',
    'Cover and let rest for 30 minutes.',
    'Bake for 25-30 minutes or until golden brown.',
    'Serve hot with your favorite side dish.',
    'Garnish with fresh herbs before serving.',
    'Let cool completely before slicing.',
    'Store in an airtight container for up to 3 days.'
  ],
  categories: [
    'breakfast', 'lunch', 'dinner', 'appetizer', 'dessert', 
    'snack', 'soup', 'salad', 'side'
  ],
  diets: [
    'vegetarian', 'vegan', 'gluten-free', 'dairy-free',
    'keto', 'paleo', 'low-carb', 'high-protein'
  ],
  difficulties: ['easy', 'medium', 'hard'],
  images: [
    'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1482049016688-2d84fb2da28d?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?q=80&w=800&auto=format&fit=crop'
  ],
  comments: [
    'Delicious recipe! My family loved it.',
    'I made this for dinner last night and it was a hit!',
    'Simple and tasty, will definitely make again.',
    'Added some extra spices and it turned out great.',
    'Perfect recipe, wouldn\'t change a thing.',
    'This has become a staple in our house!',
    'Loved how easy this was to make.',
    'Great flavors! Will be making this again soon.',
    'My kids are picky eaters but they devoured this!',
    'Restaurant quality at home. Thank you for sharing!'
  ]
};

// Helper function to get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Helper function to get random integer between min and max (inclusive)
const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// Helper function to get random date within the last year
const getRandomDate = () => {
  const now = new Date();
  const oneYearAgo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  return new Date(oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime()));
};

// Function to generate a random recipe
const generateRandomRecipe = (users) => {
  // Get a random user
  const user = getRandomItem(users);
  
  // Generate random ingredients (3-10)
  const ingredientCount = getRandomInt(3, 10);
  const ingredients = [];
  for (let i = 0; i < ingredientCount; i++) {
    let ingredient = getRandomItem(sampleData.ingredients);
    // Avoid duplicates
    while (ingredients.includes(ingredient)) {
      ingredient = getRandomItem(sampleData.ingredients);
    }
    ingredients.push(ingredient);
  }
  
  // Generate random instructions (3-8 steps)
  const instructionCount = getRandomInt(3, 8);
  const instructions = [];
  for (let i = 0; i < instructionCount; i++) {
    let instruction = getRandomItem(sampleData.instructionSteps);
    // Avoid duplicates
    while (instructions.includes(instruction)) {
      instruction = getRandomItem(sampleData.instructionSteps);
    }
    instructions.push(instruction);
  }
  
  // Generate 0-3 random diet tags
  const dietCount = getRandomInt(0, 3);
  const diet = [];
  for (let i = 0; i < dietCount; i++) {
    let dietItem = getRandomItem(sampleData.diets);
    // Avoid duplicates
    while (diet.includes(dietItem)) {
      dietItem = getRandomItem(sampleData.diets);
    }
    diet.push(dietItem);
  }
  
  // Generate 0-5 random likes
  const likeCount = getRandomInt(0, 5);
  const likes = [];
  for (let i = 0; i < likeCount; i++) {
    const likeUser = getRandomItem(users);
    // Check if this user already liked the recipe
    if (!likes.some(like => like.user.toString() === likeUser._id.toString())) {
      likes.push({
        user: likeUser._id,
        createdAt: getRandomDate()
      });
    }
  }
  
  // Generate 0-3 random comments
  const commentCount = getRandomInt(0, 3);
  const comments = [];
  for (let i = 0; i < commentCount; i++) {
    const commentUser = getRandomItem(users);
    comments.push({
      text: getRandomItem(sampleData.comments),
      rating: getRandomInt(3, 5), // Ratings between 3-5 stars
      user: commentUser._id,
      createdAt: getRandomDate()
    });
  }
  
  return {
    title: getRandomItem(sampleData.titles) + ' ' + getRandomInt(1, 99), // Add number to avoid duplicates
    description: getRandomItem(sampleData.descriptions),
    ingredients,
    instructions,
    cookingTime: getRandomInt(10, 120), // 10-120 minutes
    servings: getRandomInt(1, 8), // 1-8 servings
    difficulty: getRandomItem(sampleData.difficulties),
    category: getRandomItem(sampleData.categories),
    diet,
    image: getRandomItem(sampleData.images),
    user: user._id,
    likes,
    comments,
    createdAt: getRandomDate()
  };
};

// Main function to generate and save recipes
const generateRecipes = async (count = 100) => {
  try {
    // Get all users
    const users = await User.find();
    
    if (users.length === 0) {
      console.error('No users found in the database. Please create some users first.');
      process.exit(1);
    }
    
    console.log(`Found ${users.length} users. Generating ${count} recipes...`);
    
    // Generate and save recipes
    const recipesData = [];
    for (let i = 0; i < count; i++) {
      recipesData.push(generateRandomRecipe(users));
    }
    
    // Insert all recipes at once
    const result = await Recipe.insertMany(recipesData);
    
    console.log(`Successfully generated ${result.length} recipes!`);
    process.exit(0);
  } catch (error) {
    console.error('Error generating recipes:', error);
    process.exit(1);
  }
};

// Run the generation
generateRecipes(100); 