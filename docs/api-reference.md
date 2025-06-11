# API Reference

This document provides a comprehensive reference for the Recipedium REST API.

## Base URL

- **Development**: `http://localhost:5001/api`
- **Production**: `https://your-backend-domain.netlify.app/api`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation completed successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": "Additional error details (development only)"
}
```

## Endpoints

### Health Check

#### GET /health
Check API health status.

**Response:**
```json
{
  "status": "OK",
  "timestamp": "2024-01-20T10:30:00.000Z",
  "environment": "development"
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb74d2b2a001f5e4e1a",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "60d5ecb74d2b2a001f5e4e1a",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

### POST /auth/forgot-password
Request password reset email.

**Request Body:**
```json
{
  "email": "john@example.com"
}
```

### POST /auth/reset-password
Reset password with token from email.

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "newSecurePassword123"
}
```

---

## User Endpoints

### GET /users/profile
Get current user's profile. **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d5ecb74d2b2a001f5e4e1a",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "recipesCount": 5,
    "followersCount": 12,
    "followingCount": 8
  }
}
```

### PUT /users/profile
Update current user's profile. **Requires authentication.**

**Request Body:**
```json
{
  "username": "newusername",
  "email": "newemail@example.com",
  "bio": "I love cooking!"
}
```

### GET /users/:id
Get public user profile by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "60d5ecb74d2b2a001f5e4e1a",
    "username": "johndoe",
    "role": "user",
    "createdAt": "2024-01-20T10:30:00.000Z",
    "recipesCount": 5,
    "followersCount": 12,
    "followingCount": 8
  }
}
```

### POST /users/:id/follow
Follow a user. **Requires authentication.**

### DELETE /users/:id/follow
Unfollow a user. **Requires authentication.**

### GET /users/:id/followers
Get user's followers list.

### GET /users/:id/following
Get user's following list.

---

## Recipe Endpoints

### GET /recipes
Get recipes with optional filtering and pagination.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 50)
- `search` (string): Search in title and description
- `category` (string): Filter by category
- `difficulty` (string): Filter by difficulty (easy, medium, hard)
- `cookingTime` (number): Filter by max cooking time in minutes
- `author` (string): Filter by author ID
- `tags` (string): Comma-separated tags

**Response:**
```json
{
  "success": true,
  "data": {
    "recipes": [
      {
        "id": "60d5ecb74d2b2a001f5e4e1b",
        "title": "Chocolate Chip Cookies",
        "description": "Delicious homemade cookies",
        "category": "dessert",
        "difficulty": "easy",
        "cookingTime": 30,
        "servings": 12,
        "ingredients": [
          {
            "name": "Flour",
            "amount": "2 cups",
            "notes": "All-purpose"
          }
        ],
        "instructions": [
          {
            "step": 1,
            "instruction": "Preheat oven to 375°F"
          }
        ],
        "tags": ["cookies", "dessert", "baking"],
        "author": {
          "id": "60d5ecb74d2b2a001f5e4e1a",
          "username": "johndoe"
        },
        "createdAt": "2024-01-20T10:30:00.000Z",
        "likesCount": 15,
        "isLiked": false
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 47,
      "itemsPerPage": 10
    }
  }
}
```

### POST /recipes
Create a new recipe. **Requires authentication.**

**Request Body:**
```json
{
  "title": "Chocolate Chip Cookies",
  "description": "Delicious homemade cookies",
  "category": "dessert",
  "difficulty": "easy",
  "cookingTime": 30,
  "servings": 12,
  "ingredients": [
    {
      "name": "Flour",
      "amount": "2 cups",
      "notes": "All-purpose"
    }
  ],
  "instructions": [
    {
      "step": 1,
      "instruction": "Preheat oven to 375°F"
    }
  ],
  "tags": ["cookies", "dessert", "baking"]
}
```

### GET /recipes/:id
Get a specific recipe by ID.

### PUT /recipes/:id
Update a recipe. **Requires authentication and ownership.**

### DELETE /recipes/:id
Delete a recipe. **Requires authentication and ownership.**

### POST /recipes/:id/like
Like a recipe. **Requires authentication.**

### DELETE /recipes/:id/like
Unlike a recipe. **Requires authentication.**

### GET /recipes/:id/comments
Get recipe comments.

### POST /recipes/:id/comments
Add a comment to a recipe. **Requires authentication.**

---

## Admin Endpoints

### GET /admin/users
Get all users (admin only). **Requires admin authentication.**

### PUT /admin/users/:id/role
Update user role (admin only). **Requires admin authentication.**

### DELETE /admin/users/:id
Delete user (admin only). **Requires admin authentication.**

### GET /admin/recipes
Get all recipes for moderation (admin only). **Requires admin authentication.**

### DELETE /admin/recipes/:id
Delete any recipe (admin only). **Requires admin authentication.**

---

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 422 | Validation Error |
| 500 | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:

- **General endpoints**: 100 requests per 15 minutes per IP
- **Authentication endpoints**: 5 requests per 15 minutes per IP
- **File upload endpoints**: 10 requests per hour per user

## CORS

The API supports Cross-Origin Resource Sharing (CORS) for the following origins:

- `http://localhost:3000` (development)
- `https://your-frontend-domain.vercel.app` (production)

## Webhooks

*Coming soon: Webhook endpoints for real-time notifications* 