const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');

// Load env vars
dotenv.config();

// Global connection cache - reuse connections between function invocations
let cachedDb = null;

// Connect to MongoDB
const connectToDatabase = async () => {
  // If we have a cached connection, verify it's still connected and return it
  if (cachedDb && cachedDb.serverConfig && cachedDb.serverConfig.isConnected()) {
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
        const client = await mongoose.connect(process.env.MONGODB_URI, {
          serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
          socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
          maxIdleTimeMS: 120000, // Keep idle connections for 2 minutes
          maxPoolSize: 10, // Keep up to 10 connections
          minPoolSize: 1, // Maintain at least 1 connection
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

// Route files
const authRoutes = require('./routes/auth');
const healthRoutes = require('./routes/health');
const recipeRoutes = require('./routes/recipes');
const userRoutes = require('./routes/users');
const adminRoutes = require('./routes/admin');

// Initialize express app
const app = express();

// Body parser with increased limits for image uploads
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// Add a CORS preflight handler for OPTIONS requests
app.options('*', cors());

// Enable CORS with specific configuration
app.use(cors({
  origin: '*', // Allow all origins temporarily
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Add CORS headers to all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  next();
});

// Dev logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Mount routers with error handling for database connection
const mountRoutesWithErrorHandling = (app, route, router) => {
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

// Mount routers with connection error handling
mountRoutesWithErrorHandling(app, '/api/auth', authRoutes);
mountRoutesWithErrorHandling(app, '/api/health', healthRoutes);
mountRoutesWithErrorHandling(app, '/api/recipes', recipeRoutes);
mountRoutesWithErrorHandling(app, '/api/users', userRoutes);
mountRoutesWithErrorHandling(app, '/api/admin', adminRoutes);

// Handle 404
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

const PORT = process.env.PORT || 5000;

// Update your app.listen to connect to the database first
const startServer = async () => {
  try {
    await connectToDatabase();
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
  }
};

// Call startServer at the end of your file
startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Log error but continue running in serverless environment
  console.error('Unhandled Rejection:', err);
});