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
const healthRoutes = require('../../src/routes/health');
const recipeRoutes = require('../../src/routes/recipes');
const userRoutes = require('../../src/routes/users');
const adminRoutes = require('../../src/routes/admin');

// Global connection promise
let dbPromise = null;

// Connect to MongoDB - using a faster connect approach
const connectToDatabase = () => {
  // If we already have a connection promise, use it
  if (dbPromise) {
    return dbPromise;
  }
  
  console.log('=> Creating new database connection');
  
  // Create a new connection promise
  dbPromise = mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 3000, // Timeout after 3s instead of 30s
    socketTimeoutMS: 8000, // Close sockets after 8s of inactivity
    // Set a lower connection timeout
    connectTimeoutMS: 5000,
    // Keep up to 5 connections in Netlify functions
    maxPoolSize: 5,
    // Don't wait for secondary servers
    readPreference: 'primaryPreferred'
  })
  .then(() => {
    console.log('Connected to MongoDB');
    return mongoose.connection.db;
  })
  .catch(err => {
    console.error('Error connecting to MongoDB:', err.message);
    // Reset promise on error so we can try again
    dbPromise = null;
    throw err;
  });
  
  return dbPromise;
};

// Create Express app
const app = express();

// Body parser middleware (with lower size limits)
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://recipedium.vercel.app');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
  res.header('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

// Add a request timeout middleware
app.use((req, res, next) => {
  // Set a timeout of 9 seconds for all requests
  req.setTimeout(9000);
  
  // Also set a response timeout
  res.setTimeout(9000, () => {
    console.log('Response timeout - sending 503');
    res.status(503).json({
      success: false,
      message: 'Service temporarily unavailable, request timed out'
    });
  });
  
  next();
});

// Add health check route without DB connection
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

// Mount routers with database connection - use more efficient approach
const mountRoutesWithDb = (app, route, router) => {
  app.use(route, (req, res, next) => {
    // Try to connect to DB quickly, don't wait for full connection
    connectToDatabase()
      .then(() => {
        // Database connected, proceed to route handler
        router(req, res, next);
      })
      .catch(error => {
        console.error(`Error connecting to MongoDB: ${error.message}`);
        res.status(503).json({
          success: false,
          message: 'Database service temporarily unavailable',
        });
      });
  });
};

// Mount all routes
mountRoutesWithDb(app, '/api/auth', authRoutes);
mountRoutesWithDb(app, '/api/recipes', recipeRoutes);
mountRoutesWithDb(app, '/api/users', userRoutes);
mountRoutesWithDb(app, '/api/admin', adminRoutes);

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
});

// Export the serverless handler with performance optimizations
const handler = serverless(app);

module.exports = { handler }; 