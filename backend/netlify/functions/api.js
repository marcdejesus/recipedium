/**
 * Netlify Serverless Function Handler for Express
 * This file adapts the Express app to run as a Netlify Function
 */

const express = require('express');
const serverless = require('serverless-http');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('../../src/routes/auth');
const recipeRoutes = require('../../src/routes/recipes');
const userRoutes = require('../../src/routes/users');
const adminRoutes = require('../../src/routes/admin');

// Create Express app
const app = express();

// Body parser middleware (with lower size limits)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS middleware with dynamic origin support
app.use((req, res, next) => {
  // Get the origin from the request headers
  const origin = req.headers.origin;
  
  // List of allowed origins
  const allowedOrigins = [
    'https://recipedium.vercel.app',
    'https://recipedium.com'
  ];
  
  // Debug logging
  console.log('CORS Debug - Origin:', origin, 'Allowed:', allowedOrigins.includes(origin));
  
  // Set the appropriate origin header - only set if origin is allowed
  if (allowedOrigins.includes(origin)) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Add health check route without DB connection
app.get('/api/health', (req, res) => {
  console.log('Health check endpoint called');
  return res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Root route that doesn't require DB connection
app.get('/', (req, res) => {
  console.log('Root endpoint called');
  return res.status(200).json({
    message: 'Recipedium API - Welcome',
    endpoints: ['/api/health', '/api/recipes', '/api/auth', '/api/users']
  });
});

app.get('/api', (req, res) => {
  console.log('API root endpoint called');
  return res.status(200).json({
    message: 'Recipedium API - Welcome',
    endpoints: ['/api/health', '/api/recipes', '/api/auth', '/api/users']
  });
});

// Global connection variable
let dbConnection = null;

// Simple database connection function
const connectToDb = async () => {
  if (dbConnection && mongoose.connection.readyState === 1) {
    return dbConnection;
  }
  
  try {
    console.log('Connecting to MongoDB...');
    
    // Add these logs to debug the connection
    console.log('MongoDB URI:', process.env.MONGODB_URI ? 'URI exists' : 'URI missing');
    
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 8000,
      connectTimeoutMS: 5000,
      maxPoolSize: 5
    });
    
    console.log('Successfully connected to MongoDB');
    dbConnection = mongoose.connection;
    return dbConnection;
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    return null;
  }
};

// Wrap route with database connection
const withDb = (router) => async (req, res, next) => {
  try {
    await connectToDb();
    router(req, res, next);
  } catch (error) {
    console.error('Database error:', error.message);
    res.status(503).json({
      success: false,
      message: 'Database connection failed'
    });
  }
};

// Mount routes with database connection
app.use('/api/auth', withDb(authRoutes));
app.use('/api/recipes', withDb(recipeRoutes));
app.use('/api/users', withDb(userRoutes));
app.use('/api/admin', withDb(adminRoutes));

// Handle 404 routes
app.use((req, res) => {
  console.log('404 Not Found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal Server Error'
  });
});

// Create serverless handler
const handler = serverless(app);

module.exports.handler = handler; 