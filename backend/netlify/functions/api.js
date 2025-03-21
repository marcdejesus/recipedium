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

// Global MongoDB connection cache
let cachedDb = null;

// Connect to MongoDB with connection pooling and reuse
const connectToDatabase = async () => {
  // If we already have a connection, use it
  if (cachedDb && mongoose.connection.readyState === 1) {
    console.log('=> Using cached database connection');
    return cachedDb;
  }

  console.log('=> Creating new database connection');
  try {
    // Connect with retry logic
    const maxRetries = 3;
    let retries = 0;
    let lastError;

    while (retries < maxRetries) {
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
          socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
          maxPoolSize: 10, // Keep up to 10 connections
          minPoolSize: 1 // Maintain at least 1 connection
        });
        
        console.log('Connected to MongoDB');
        
        // Cache the database connection
        cachedDb = mongoose.connection.db;
        
        // Setup event handlers for the connection
        mongoose.connection.on('error', (err) => {
          console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
          console.log('MongoDB disconnected, will reconnect if needed');
          cachedDb = null;
        });
        
        return cachedDb;
      } catch (err) {
        lastError = err;
        retries++;
        console.log(`MongoDB connection attempt ${retries} failed: ${err.message}`);
        // Add exponential backoff delay between retries
        if (retries < maxRetries) {
          const delay = Math.pow(2, retries) * 100;
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    console.error(`Failed to connect to MongoDB after ${maxRetries} attempts:`, lastError);
    throw lastError;
  } catch (err) {
    console.error('Error connecting to database:', err);
    throw err;
  }
};

// Create Express app
const app = express();

// Body parser middleware
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

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

// Mount routers with database connection
const mountRoutesWithDb = (app, route, router) => {
  app.use(route, async (req, res, next) => {
    try {
      // Ensure DB is connected for each request
      await connectToDatabase();
      router(req, res, next);
    } catch (error) {
      console.error(`Error connecting to MongoDB: ${error.message}`);
      return res.status(503).json({
        success: false,
        message: 'Database service temporarily unavailable',
      });
    }
  });
};

// Mount all routes
mountRoutesWithDb(app, '/api/auth', authRoutes);
mountRoutesWithDb(app, '/api/health', healthRoutes);
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

// Export the serverless handler
const handler = serverless(app);
module.exports = { handler }; 