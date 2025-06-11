# Database Schema

This document describes the MongoDB database schema for Recipedium, including all collections, their fields, relationships, and validation rules.

## Overview

Recipedium uses MongoDB as its primary database with Mongoose ODM for schema definition and validation. The database consists of two main collections:

- **users** - User accounts and profiles
- **recipes** - Recipe data and metadata

## Collections

### Users Collection

The `users` collection stores user account information, authentication data, and profile details.

#### Schema Definition

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  username: String,                 // Unique username (3-30 chars)
  email: String,                    // Unique email address
  password: String,                 // Hashed password (bcrypt)
  role: String,                     // User role: 'user' | 'admin'
  
  // Profile Information
  bio: String,                      // User biography (max 500 chars)
  avatar: String,                   // Avatar image URL
  
  // Social Features
  followers: [ObjectId],            // Array of user IDs following this user
  following: [ObjectId],            // Array of user IDs this user follows
  favorites: [ObjectId],            // Array of recipe IDs user has favorited
  
  // Password Reset
  resetPasswordToken: String,       // Temporary token for password reset
  resetPasswordExpire: Date,        // Token expiration date
  
  // Metadata
  createdAt: Date,                  // Account creation timestamp
  updatedAt: Date,                  // Last update timestamp
  lastLogin: Date                   // Last login timestamp
}
```

#### Field Details

| Field | Type | Required | Unique | Description |
|-------|------|----------|--------|-------------|
| `username` | String | ✅ | ✅ | 3-30 characters, alphanumeric and underscores only |
| `email` | String | ✅ | ✅ | Valid email format, normalized to lowercase |
| `password` | String | ✅ | ❌ | Minimum 6 characters, hashed with bcrypt |
| `role` | String | ✅ | ❌ | Enum: `['user', 'admin']`, defaults to `'user'` |
| `bio` | String | ❌ | ❌ | Maximum 500 characters |
| `avatar` | String | ❌ | ❌ | Valid URL format |
| `followers` | Array | ❌ | ❌ | Array of ObjectId references to users |
| `following` | Array | ❌ | ❌ | Array of ObjectId references to users |
| `favorites` | Array | ❌ | ❌ | Array of ObjectId references to recipes |

#### Indexes

```javascript
// Compound index for efficient queries
db.users.createIndex({ "email": 1 })
db.users.createIndex({ "username": 1 })
db.users.createIndex({ "role": 1 })
db.users.createIndex({ "createdAt": -1 })
```

#### Validation Rules

- **Username**: 3-30 characters, alphanumeric and underscores only
- **Email**: Valid email format, case-insensitive uniqueness
- **Password**: Minimum 6 characters (validated before hashing)
- **Role**: Must be either 'user' or 'admin'

---

### Recipes Collection

The `recipes` collection stores all recipe data including ingredients, instructions, and metadata.

#### Schema Definition

```javascript
{
  _id: ObjectId,                    // Auto-generated MongoDB ID
  title: String,                    // Recipe title (required)
  description: String,              // Recipe description
  
  // Recipe Details
  category: String,                 // Recipe category
  difficulty: String,               // Difficulty level: 'easy' | 'medium' | 'hard'
  cookingTime: Number,              // Cooking time in minutes
  prepTime: Number,                 // Preparation time in minutes
  servings: Number,                 // Number of servings
  
  // Recipe Content
  ingredients: [{
    name: String,                   // Ingredient name (required)
    amount: String,                 // Quantity (e.g., "2 cups")
    unit: String,                   // Unit of measurement
    notes: String                   // Additional notes
  }],
  
  instructions: [{
    step: Number,                   // Step number (required)
    instruction: String,            // Step instruction (required)
    image: String,                  // Optional step image URL
    duration: Number                // Optional step duration in minutes
  }],
  
  // Media and Tags
  image: String,                    // Main recipe image URL
  images: [String],                 // Additional recipe images
  tags: [String],                   // Recipe tags for searching
  
  // Author and Social
  author: ObjectId,                 // Reference to user who created recipe
  likes: [ObjectId],                // Array of user IDs who liked recipe
  
  // Nutritional Information (Optional)
  nutrition: {
    calories: Number,               // Calories per serving
    protein: Number,                // Protein in grams
    carbs: Number,                  // Carbohydrates in grams
    fat: Number,                    // Fat in grams
    fiber: Number,                  // Fiber in grams
    sugar: Number                   // Sugar in grams
  },
  
  // Metadata
  createdAt: Date,                  // Recipe creation timestamp
  updatedAt: Date,                  // Last update timestamp
  published: Boolean,               // Whether recipe is published
  featured: Boolean                 // Whether recipe is featured (admin only)
}
```

#### Field Details

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `title` | String | ✅ | 3-100 characters, recipe title |
| `description` | String | ❌ | Maximum 1000 characters |
| `category` | String | ❌ | Recipe category (appetizer, main, dessert, etc.) |
| `difficulty` | String | ❌ | Enum: `['easy', 'medium', 'hard']` |
| `cookingTime` | Number | ❌ | Cooking time in minutes (1-1440) |
| `prepTime` | Number | ❌ | Preparation time in minutes (1-1440) |
| `servings` | Number | ❌ | Number of servings (1-100) |
| `ingredients` | Array | ✅ | Minimum 1 ingredient required |
| `instructions` | Array | ✅ | Minimum 1 instruction step required |
| `author` | ObjectId | ✅ | Reference to users collection |
| `published` | Boolean | ❌ | Defaults to `true` |

#### Indexes

```javascript
// Compound indexes for efficient queries
db.recipes.createIndex({ "author": 1, "createdAt": -1 })
db.recipes.createIndex({ "category": 1, "difficulty": 1 })
db.recipes.createIndex({ "tags": 1 })
db.recipes.createIndex({ "title": "text", "description": "text" })
db.recipes.createIndex({ "createdAt": -1 })
db.recipes.createIndex({ "published": 1 })
```

#### Validation Rules

- **Title**: 3-100 characters, required
- **Description**: Maximum 1000 characters
- **Difficulty**: Must be 'easy', 'medium', or 'hard'
- **Cooking/Prep Time**: 1-1440 minutes (24 hours max)
- **Servings**: 1-100 servings
- **Ingredients**: At least one ingredient required
- **Instructions**: At least one instruction step required

---

## Relationships

### User → Recipes (One-to-Many)
- One user can create multiple recipes
- Each recipe has exactly one author
- Foreign key: `recipes.author` → `users._id`

### User → User (Many-to-Many) - Following/Followers
- Users can follow other users
- Implemented via arrays in user document
- `users.following` contains IDs of followed users
- `users.followers` contains IDs of followers

### User → Recipes (Many-to-Many) - Favorites
- Users can favorite multiple recipes
- Stored in `users.favorites` array
- Contains ObjectId references to recipes

### User → Recipes (Many-to-Many) - Likes
- Users can like multiple recipes
- Stored in `recipes.likes` array
- Contains ObjectId references to users

## Data Patterns

### Embedded vs Referenced Data

**Embedded Documents:**
- Recipe ingredients (embedded in recipe document)
- Recipe instructions (embedded in recipe document)
- User social arrays (followers, following, favorites)

**Referenced Documents:**
- Recipe author (referenced to users collection)
- Recipe likes (array of user ObjectIds)

### Denormalization

The schema includes some denormalized data for performance:
- Recipe author information may be cached in client applications
- User counts (followers, recipes) are calculated dynamically

## Migration Scripts

### Creating Indexes

```javascript
// Run in MongoDB shell
use recipedium

// User indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "username": 1 }, { unique: true })

// Recipe indexes
db.recipes.createIndex({ "author": 1, "createdAt": -1 })
db.recipes.createIndex({ "title": "text", "description": "text" })
```

### Data Validation

```javascript
// Example validation for users collection
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["username", "email", "password"],
      properties: {
        username: {
          bsonType: "string",
          minLength: 3,
          maxLength: 30
        },
        email: {
          bsonType: "string",
          pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
        },
        role: {
          enum: ["user", "admin"]
        }
      }
    }
  }
})
```

## Performance Considerations

### Query Optimization
- Use compound indexes for common query patterns
- Limit result sets with pagination
- Use projection to return only needed fields

### Data Size Management
- Recipe images stored as URLs (external storage)
- Large text fields (descriptions) have reasonable limits
- Arrays (followers, likes) should be monitored for size

### Aggregation Pipelines
Common aggregations include:
- Recipe counts per user
- Popular recipes (most likes)
- Recipe recommendations based on user favorites

## Backup and Recovery

### Backup Strategy
```bash
# Daily backup
mongodump --db recipedium --out /backups/$(date +%Y%m%d)

# Restore from backup
mongorestore --db recipedium /backups/20240120/recipedium
```

### Data Retention
- User accounts: Retained indefinitely unless deleted
- Recipes: Retained indefinitely unless deleted by user/admin
- Authentication tokens: Expire based on JWT settings 