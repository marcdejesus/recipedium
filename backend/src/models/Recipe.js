const mongoose = require('mongoose');

// Define comment schema
const CommentSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Comment text is required'],
    trim: true
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const RecipeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot be more than 100 characters']
  },
  description: {
    type: String,
    required: false,
    trim: true
  },
  ingredients: {
    type: [String],
    required: [true, 'Please add at least one ingredient'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Please add at least one ingredient'
    }
  },
  instructions: {
    type: [String],
    required: [true, 'Please add at least one instruction step'],
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Please add at least one instruction step'
    }
  },
  cookingTime: {
    type: Number,
    required: false,
    default: 30
  },
  servings: {
    type: Number,
    required: false,
    default: 4
  },
  difficulty: {
    type: String,
    required: false,
    enum: ['easy', 'medium', 'hard', 'Easy', 'Medium', 'Hard'],
    default: 'medium'
  },
  category: {
    type: String,
    required: false,
    enum: [
      'breakfast', 'lunch', 'dinner', 'dessert', 'snack', 'appetizer', 'drink', 'salad', 'soup', 'side',
      'Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Drink', 'Salad', 'Soup', 'Side'
    ],
    default: 'dinner'
  },
  diet: {
    type: [String],
    required: false,
    default: []
  },
  image: {
    type: String,
    default: 'no-photo.jpg'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      createdAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  comments: [CommentSchema],
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual fields
RecipeSchema.virtual('likesCount').get(function() {
  return this.likes.length;
});

RecipeSchema.virtual('commentsCount').get(function() {
  return this.comments.length;
});

module.exports = mongoose.model('Recipe', RecipeSchema); 