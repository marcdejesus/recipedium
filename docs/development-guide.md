# Development Guide

This guide provides comprehensive information for developers working on Recipedium, including setup instructions, coding standards, debugging techniques, and best practices.

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Environment](#development-environment)
3. [Coding Standards](#coding-standards)
4. [Architecture Guidelines](#architecture-guidelines)
5. [Testing Strategy](#testing-strategy)
6. [Debugging](#debugging)
7. [Performance](#performance)
8. [Security](#security)
9. [Git Workflow](#git-workflow)

## Getting Started

### Prerequisites

Ensure you have the following installed:
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher
- **Docker**: Latest stable version
- **Git**: Latest version
- **MongoDB**: v6.x or higher (optional for local development)

### Quick Setup

1. **Clone and Setup**
   ```bash
   git clone <repository-url>
   cd recipedium
   ```

2. **Environment Configuration**
   ```bash
   # Backend
   cp backend/env.example backend/.env
   # Edit backend/.env with your configuration
   
   # Frontend
   cp frontend/env.example frontend/.env.local
   # Edit frontend/.env.local with your configuration
   ```

3. **Install Dependencies**
   ```bash
   # Install all dependencies
   npm run install:all
   
   # Or manually
   cd frontend && npm install && cd ..
   cd backend && npm install && cd ..
   ```

4. **Start Development Environment**
   ```bash
   # Using Docker (recommended)
   docker compose -f compose.dev.yaml up --build --watch
   
   # Or manually
   # Terminal 1: Start MongoDB
   docker run -d -p 27017:27017 mongo:latest
   
   # Terminal 2: Start Backend
   cd backend && npm run dev
   
   # Terminal 3: Start Frontend
   cd frontend && npm run dev
   ```

## Development Environment

### Directory Structure

```
recipedium/
├── frontend/                 # Next.js frontend application
│   ├── components/          # Reusable UI components
│   │   ├── ui/             # Base UI components (shadcn/ui)
│   │   ├── navigation/     # Navigation components
│   │   ├── landing/        # Landing page components
│   │   ├── home/           # Home page components
│   │   └── admin/          # Admin-specific components
│   ├── pages/              # Next.js pages and routing
│   ├── lib/                # Utility functions and API client
│   ├── styles/             # Global styles and Tailwind config
│   └── public/             # Static assets
├── backend/                 # Express.js backend API
│   ├── src/                # Source code
│   │   ├── controllers/    # Route handlers
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── middleware/     # Custom middleware
│   │   └── config/         # Configuration files
│   ├── tests/              # Test files
│   ├── netlify/            # Netlify function wrappers
│   └── scripts/            # Utility scripts
└── docs/                   # Documentation
```

### Environment Variables

#### Backend (.env)
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/recipedium
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development

# Optional
PORT=5000
JWT_EXPIRE=30d
LOG_LEVEL=info
```

#### Frontend (.env.local)
```bash
# Required
NEXT_PUBLIC_API_URL=http://localhost:5001/api

# Optional
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_DEBUG_MODE=true
```

### Development Scripts

#### Frontend Scripts
```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run start       # Start production server
npm run lint        # Run ESLint
npm run lint:fix    # Fix ESLint issues
npm run test        # Run tests
npm run test:watch  # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

#### Backend Scripts
```bash
npm run dev         # Start with nodemon
npm start           # Start production server
npm test            # Run tests
npm run test:watch  # Run tests in watch mode
npm run build       # Build Netlify functions
npm run start:netlify # Start Netlify dev server
```

## Coding Standards

### JavaScript/TypeScript

#### Naming Conventions
- **Variables & Functions**: camelCase (`userName`, `getUserData`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `MAX_RETRIES`)
- **Components**: PascalCase (`UserProfile`, `RecipeCard`)
- **Files**: kebab-case (`user-profile.jsx`, `recipe-service.js`)

#### Code Style
```javascript
// ✅ Good
const fetchUserRecipes = async (userId) => {
  try {
    const response = await api.get(`/users/${userId}/recipes`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch user recipes:', error);
    throw error;
  }
};

// ❌ Avoid
const fetchUserRecipes=async(userId)=>{
try{
const response=await api.get('/users/'+userId+'/recipes')
return response.data
}catch(error){
console.error(error)
throw error
}}
```

#### Best Practices

1. **Use Descriptive Names**
   ```javascript
   // ✅ Good
   const isUserLoggedIn = checkAuthStatus();
   const recipeFormData = buildRecipePayload(formValues);
   
   // ❌ Avoid
   const flag = check();
   const data = build(values);
   ```

2. **Handle Errors Gracefully**
   ```javascript
   // ✅ Good
   try {
     const result = await apiCall();
     return result;
   } catch (error) {
     logger.error('API call failed:', error);
     throw new Error('Failed to process request');
   }
   ```

3. **Use Early Returns**
   ```javascript
   // ✅ Good
   function validateUser(user) {
     if (!user) return { valid: false, error: 'User required' };
     if (!user.email) return { valid: false, error: 'Email required' };
     return { valid: true };
   }
   ```

### React/Next.js

#### Component Structure
```jsx
// ✅ Good component structure
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RecipeCard = ({ recipe, onLike, className }) => {
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    setIsLiked(recipe.isLiked);
  }, [recipe.isLiked]);

  const handleLike = async () => {
    try {
      await onLike(recipe.id);
      setIsLiked(!isLiked);
    } catch (error) {
      console.error('Failed to like recipe:', error);
    }
  };

  return (
    <div className={`recipe-card ${className}`}>
      <h3>{recipe.title}</h3>
      <button onClick={handleLike}>
        {isLiked ? '❤️' : '🤍'}
      </button>
    </div>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.object.isRequired,
  onLike: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default RecipeCard;
```

#### Hooks Guidelines
```javascript
// ✅ Custom hooks for reusable logic
const useRecipes = (userId) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        setLoading(true);
        const data = await api.getUserRecipes(userId);
        setRecipes(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchRecipes();
    }
  }, [userId]);

  return { recipes, loading, error };
};
```

### CSS/Tailwind

#### Class Organization
```jsx
// ✅ Good - grouped by type
<div className="
  flex items-center justify-between
  px-4 py-2 
  bg-white border border-gray-200 rounded-lg 
  hover:bg-gray-50 
  transition-colors duration-200
">
```

#### Responsive Design
```jsx
// ✅ Mobile-first approach
<div className="
  grid grid-cols-1 
  md:grid-cols-2 
  lg:grid-cols-3 
  gap-4
">
```

## Architecture Guidelines

### API Design

#### RESTful Principles
```javascript
// ✅ Good API design
GET    /api/recipes           // Get all recipes
POST   /api/recipes           // Create recipe
GET    /api/recipes/:id       // Get specific recipe
PUT    /api/recipes/:id       // Update recipe
DELETE /api/recipes/:id       // Delete recipe

POST   /api/recipes/:id/like  // Like recipe
DELETE /api/recipes/:id/like  // Unlike recipe
```

#### Error Handling
```javascript
// ✅ Consistent error responses
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    error: err.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};
```

### State Management

#### Local State vs Context
```jsx
// ✅ Use local state for component-specific data
const [isOpen, setIsOpen] = useState(false);

// ✅ Use context for app-wide state
const { user, login, logout } = useAuth();
```

### Database Patterns

#### Query Optimization
```javascript
// ✅ Good - use projection and pagination
const recipes = await Recipe
  .find({ author: userId })
  .select('title description cookingTime')
  .limit(20)
  .skip((page - 1) * 20)
  .sort({ createdAt: -1 });
```

## Testing Strategy

### Unit Tests
```javascript
// ✅ Test utility functions
describe('formatCookingTime', () => {
  it('should format minutes correctly', () => {
    expect(formatCookingTime(30)).toBe('30 min');
    expect(formatCookingTime(90)).toBe('1h 30min');
  });
});
```

### Integration Tests
```javascript
// ✅ Test API endpoints
describe('POST /api/recipes', () => {
  it('should create a new recipe', async () => {
    const recipeData = {
      title: 'Test Recipe',
      ingredients: [{ name: 'flour', amount: '2 cups' }],
      instructions: [{ step: 1, instruction: 'Mix ingredients' }]
    };

    const response = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(recipeData)
      .expect(201);

    expect(response.body.data.title).toBe('Test Recipe');
  });
});
```

### Component Tests
```jsx
// ✅ Test React components
import { render, screen, fireEvent } from '@testing-library/react';
import RecipeCard from './RecipeCard';

test('renders recipe title', () => {
  const recipe = { id: '1', title: 'Test Recipe' };
  render(<RecipeCard recipe={recipe} onLike={jest.fn()} />);
  
  expect(screen.getByText('Test Recipe')).toBeInTheDocument();
});
```

## Debugging

### Frontend Debugging

#### React DevTools
```jsx
// Add debug info to components
const RecipeCard = ({ recipe }) => {
  console.log('RecipeCard render:', { recipe }); // Remove in production
  
  return <div>{recipe.title}</div>;
};
```

#### Network Debugging
```javascript
// Log API requests
const api = {
  async get(url) {
    console.log('API GET:', url);
    const response = await fetch(url);
    console.log('API Response:', response.status);
    return response;
  }
};
```

### Backend Debugging

#### Logging
```javascript
// Use structured logging
const logger = require('./logger');

app.use((req, res, next) => {
  logger.info('Request received', {
    method: req.method,
    url: req.url,
    userAgent: req.get('User-Agent')
  });
  next();
});
```

#### Database Debugging
```javascript
// Log MongoDB queries in development
if (process.env.NODE_ENV === 'development') {
  mongoose.set('debug', true);
}
```

## Performance

### Frontend Optimization

#### Code Splitting
```jsx
// ✅ Lazy load components
const AdminPanel = lazy(() => import('./AdminPanel'));

const App = () => (
  <Suspense fallback={<div>Loading...</div>}>
    <AdminPanel />
  </Suspense>
);
```

#### Image Optimization
```jsx
// ✅ Use Next.js Image component
import Image from 'next/image';

<Image
  src="/recipe-image.jpg"
  alt="Recipe"
  width={300}
  height={200}
  priority={false}
/>
```

### Backend Optimization

#### Database Queries
```javascript
// ✅ Use indexes and projections
const recipes = await Recipe
  .find({ category: 'dessert' })
  .select('title author createdAt')
  .populate('author', 'username')
  .lean(); // Returns plain objects instead of Mongoose documents
```

#### Caching
```javascript
// ✅ Cache expensive operations
const cache = new Map();

const getPopularRecipes = async () => {
  const cacheKey = 'popular-recipes';
  
  if (cache.has(cacheKey)) {
    return cache.get(cacheKey);
  }
  
  const recipes = await Recipe.find().sort({ likes: -1 }).limit(10);
  cache.set(cacheKey, recipes);
  
  setTimeout(() => cache.delete(cacheKey), 5 * 60 * 1000); // 5 min cache
  
  return recipes;
};
```

## Security

### Input Validation
```javascript
// ✅ Validate and sanitize inputs
const { body, validationResult } = require('express-validator');

const validateRecipe = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 100 })
    .escape(),
  body('ingredients')
    .isArray({ min: 1 })
    .withMessage('At least one ingredient required'),
  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }
    next();
  }
];
```

### Authentication
```javascript
// ✅ Protect routes
const requireAuth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Access denied' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## Git Workflow

### Branch Naming
- `feature/recipe-search` - New features
- `bugfix/login-error` - Bug fixes
- `hotfix/security-patch` - Critical fixes
- `refactor/api-structure` - Code refactoring

### Commit Messages
```bash
# ✅ Good commit messages
feat: add recipe search functionality
fix: resolve login authentication error
docs: update API documentation
test: add unit tests for recipe validation
refactor: simplify user authentication flow

# ❌ Avoid
fix stuff
update code
changes
```

### Pull Request Process
1. Create feature branch from `main`
2. Make changes and write tests
3. Ensure all tests pass
4. Update documentation if needed
5. Create pull request with clear description
6. Request code review
7. Address feedback and merge

### Code Review Checklist
- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is proper
- [ ] No console.log statements in production code 