const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

// Connect to database
const connectDB = require('./config/db');
// Try connecting to MongoDB but don't block startup
connectDB().catch(err => {
  console.error(`MongoDB initial connection error: ${err.message}`);
  // We'll retry on individual requests
});

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
      await connectDB();
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

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  server.close(() => process.exit(1));
}); 