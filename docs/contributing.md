# Contributing to Recipedium

Thank you for your interest in contributing to Recipedium! This guide will help you get started with contributing to our recipe sharing platform.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Process](#development-process)
4. [Coding Standards](#coding-standards)
5. [Testing Requirements](#testing-requirements)
6. [Pull Request Process](#pull-request-process)
7. [Issue Guidelines](#issue-guidelines)
8. [Documentation](#documentation)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct:

- **Be respectful**: Treat all contributors with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be patient**: Understand that everyone has different experience levels
- **Focus on what's best**: Prioritize the project's success over personal preferences

## Getting Started

### Prerequisites

Before contributing, ensure you have:
- Node.js 18.x or higher
- npm 9.x or higher
- Git
- Docker (recommended for development)
- Basic knowledge of React, Next.js, and Express.js

### Setting Up Your Development Environment

1. **Fork the Repository**
   ```bash
   # Fork the repository on GitHub, then clone your fork
   git clone https://github.com/YOUR-USERNAME/recipedium.git
   cd recipedium
   ```

2. **Add Upstream Remote**
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/recipedium.git
   ```

3. **Install Dependencies**
   ```bash
   # Install frontend dependencies
   cd frontend && npm install && cd ..
   
   # Install backend dependencies
   cd backend && npm install && cd ..
   ```

4. **Set Up Environment Variables**
   ```bash
   # Copy example environment files
   cp backend/env.example backend/.env
   cp frontend/env.example frontend/.env.local
   
   # Edit the files with your local configuration
   ```

5. **Start Development Environment**
   ```bash
   # Using Docker (recommended)
   docker compose -f compose.dev.yaml up --build --watch
   
   # Or manually start services
   # Terminal 1: Backend
   cd backend && npm run dev
   
   # Terminal 2: Frontend
   cd frontend && npm run dev
   ```

## Development Process

### Workflow Overview

1. Create an issue or pick an existing one
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Update documentation
6. Submit a pull request
7. Address review feedback
8. Celebrate when it's merged! 🎉

### Branch Naming Convention

Use descriptive branch names that follow this pattern:

```bash
# Features
feature/recipe-search-filters
feature/user-profile-editing
feature/recipe-rating-system

# Bug fixes
bugfix/login-authentication-error
bugfix/recipe-image-upload-fail

# Documentation
docs/api-documentation-update
docs/setup-instructions

# Refactoring
refactor/user-authentication-flow
refactor/database-queries
```

### Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```bash
# Format: <type>(<scope>): <description>

# Examples:
feat(auth): add password reset functionality
fix(recipes): resolve image upload validation error
docs(api): update authentication endpoints
test(users): add unit tests for user registration
refactor(db): optimize recipe query performance
style(frontend): fix linting issues in components
chore(deps): update dependencies to latest versions
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, semicolons, etc.)
- `refactor`: Code refactoring without feature changes
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependency updates

## Coding Standards

### JavaScript/TypeScript Style

We use ESLint and Prettier for code formatting. Make sure to:

```bash
# Run linting
npm run lint

# Fix auto-fixable issues
npm run lint:fix

# Format code
npm run format
```

### Code Quality Guidelines

#### 1. Naming Conventions
```javascript
// ✅ Good
const userAuthentication = true;
const fetchUserRecipes = async () => {};
const UserProfileCard = () => {};
const API_BASE_URL = 'https://api.example.com';

// ❌ Avoid
const auth = true;
const getUserRec = async () => {};
const userprofilecard = () => {};
const apiUrl = 'https://api.example.com';
```

#### 2. Function Structure
```javascript
// ✅ Good
const createRecipe = async (recipeData) => {
  try {
    validateRecipeData(recipeData);
    const recipe = await Recipe.create(recipeData);
    return { success: true, data: recipe };
  } catch (error) {
    logger.error('Failed to create recipe:', error);
    throw new Error('Recipe creation failed');
  }
};

// ❌ Avoid
const createRecipe = async (data) => {
  return await Recipe.create(data);
};
```

#### 3. React Component Guidelines
```jsx
// ✅ Good
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

const RecipeCard = ({ recipe, onLike, className = '' }) => {
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
      // Show user-friendly error message
    }
  };

  return (
    <article className={`recipe-card ${className}`}>
      <h3>{recipe.title}</h3>
      <button 
        onClick={handleLike}
        aria-label={isLiked ? 'Unlike recipe' : 'Like recipe'}
      >
        {isLiked ? '❤️' : '🤍'}
      </button>
    </article>
  );
};

RecipeCard.propTypes = {
  recipe: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    isLiked: PropTypes.bool
  }).isRequired,
  onLike: PropTypes.func.isRequired,
  className: PropTypes.string
};

export default RecipeCard;
```

### Backend Guidelines

#### 1. API Route Structure
```javascript
// ✅ Good
const express = require('express');
const { body, validationResult } = require('express-validator');
const Recipe = require('../models/Recipe');
const auth = require('../middleware/auth');

const router = express.Router();

// GET /api/recipes
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 10, search, category } = req.query;
    
    const filter = {};
    if (search) filter.$text = { $search: search };
    if (category) filter.category = category;

    const recipes = await Recipe
      .find(filter)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        recipes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(await Recipe.countDocuments(filter) / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch recipes'
    });
  }
});

module.exports = router;
```

#### 2. Error Handling
```javascript
// ✅ Good - Centralized error handling
const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error(err);

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    const message = 'Resource not found';
    error = { message, statusCode: 404 };
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = { message, statusCode: 400 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Server Error'
  });
};
```

## Testing Requirements

### Frontend Testing

All new features must include appropriate tests:

```javascript
// Component tests
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import RecipeCard from './RecipeCard';

describe('RecipeCard', () => {
  const mockRecipe = {
    id: '1',
    title: 'Test Recipe',
    isLiked: false
  };

  const mockOnLike = jest.fn();

  beforeEach(() => {
    mockOnLike.mockClear();
  });

  it('renders recipe title', () => {
    render(<RecipeCard recipe={mockRecipe} onLike={mockOnLike} />);
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

  it('handles like button click', async () => {
    const user = userEvent.setup();
    render(<RecipeCard recipe={mockRecipe} onLike={mockOnLike} />);
    
    const likeButton = screen.getByRole('button');
    await user.click(likeButton);
    
    expect(mockOnLike).toHaveBeenCalledWith('1');
  });
});
```

### Backend Testing

```javascript
// API endpoint tests
const request = require('supertest');
const app = require('../src/app');
const Recipe = require('../src/models/Recipe');
const User = require('../src/models/User');

describe('POST /api/recipes', () => {
  let authToken;
  let userId;

  beforeEach(async () => {
    // Create test user and get auth token
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'password123'
    });
    userId = user._id;
    authToken = user.getSignedJwtToken();
  });

  afterEach(async () => {
    await Recipe.deleteMany({});
    await User.deleteMany({});
  });

  it('should create a new recipe', async () => {
    const recipeData = {
      title: 'Test Recipe',
      description: 'A test recipe',
      ingredients: [{ name: 'flour', amount: '2 cups' }],
      instructions: [{ step: 1, instruction: 'Mix ingredients' }]
    };

    const response = await request(app)
      .post('/api/recipes')
      .set('Authorization', `Bearer ${authToken}`)
      .send(recipeData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Recipe');
    expect(response.body.data.author).toBe(userId.toString());
  });
});
```

### Running Tests

```bash
# Frontend tests
cd frontend
npm test                    # Run tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage

# Backend tests
cd backend
npm test                    # Run tests once
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Run tests with coverage
```

## Pull Request Process

### Before Submitting

1. **Sync with upstream**
   ```bash
   git fetch upstream
   git checkout main
   git merge upstream/main
   git push origin main
   ```

2. **Create feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Make your changes and commit**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Run tests and linting**
   ```bash
   # Frontend
   cd frontend
   npm run lint
   npm test
   npm run build

   # Backend
   cd backend
   npm run lint
   npm test
   ```

5. **Push to your fork**
   ```bash
   git push origin feature/your-feature-name
   ```

### Pull Request Template

When creating a pull request, please include:

```markdown
## Description
Brief description of what this PR does.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Testing
- [ ] Tests pass locally
- [ ] I have added tests that prove my fix is effective or that my feature works
- [ ] New and existing unit tests pass locally with my changes

## Screenshots (if applicable)
Add screenshots to help explain your changes.

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
```

### Review Process

1. **Automated Checks**: CI/CD will run tests and linting
2. **Code Review**: At least one maintainer will review your code
3. **Feedback**: Address any feedback or requested changes
4. **Approval**: Once approved, your PR will be merged

## Issue Guidelines

### Reporting Bugs

Use the bug report template:

```markdown
**Describe the bug**
A clear and concise description of what the bug is.

**To Reproduce**
Steps to reproduce the behavior:
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

**Expected behavior**
A clear and concise description of what you expected to happen.

**Screenshots**
If applicable, add screenshots to help explain your problem.

**Environment:**
 - OS: [e.g. iOS, Windows, Linux]
 - Browser [e.g. chrome, safari]
 - Version [e.g. 22]

**Additional context**
Add any other context about the problem here.
```

### Feature Requests

Use the feature request template:

```markdown
**Is your feature request related to a problem? Please describe.**
A clear and concise description of what the problem is.

**Describe the solution you'd like**
A clear and concise description of what you want to happen.

**Describe alternatives you've considered**
A clear and concise description of any alternative solutions or features you've considered.

**Additional context**
Add any other context or screenshots about the feature request here.
```

## Documentation

### Documentation Requirements

- **API Changes**: Update API documentation in `docs/api-reference.md`
- **New Features**: Add documentation to relevant files in `docs/`
- **Configuration Changes**: Update environment variable documentation
- **Database Changes**: Update `docs/database-schema.md`

### Writing Guidelines

- Use clear, concise language
- Include code examples where helpful
- Add screenshots for UI changes
- Keep documentation up-to-date with code changes

## Getting Help

### Resources

- **Documentation**: Check the `docs/` directory
- **Issues**: Search existing issues before creating new ones
- **Discussions**: Use GitHub Discussions for general questions

### Communication Channels

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and discussions
- **Pull Request Comments**: For code-specific discussions

## Recognition

Contributors will be:
- Listed in the project's contributors section
- Mentioned in release notes for significant contributions
- Invited to be maintainers for exceptional ongoing contributions

Thank you for contributing to Recipedium! Your efforts help make this project better for everyone. 🙏 