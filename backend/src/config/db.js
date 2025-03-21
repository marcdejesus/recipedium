const mongoose = require('mongoose');

// Global variable to store the database connection
let cachedConnection = null;

// Connect to MongoDB with caching for serverless environment
const connectDB = async () => {
  // If we already have a connection, return it
  if (cachedConnection) {
    console.log('Using cached database connection');
    return cachedConnection;
  }

  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is missing in environment variables');
    }
    
    // Check if the connection string has the correct format
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }
    
    console.log('Establishing new MongoDB connection...');
    
    // Connection options optimized for serverless
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000, // Reduce the timeout to 5 seconds
      socketTimeoutMS: 45000, // Socket timeout
      connectTimeoutMS: 10000, // Connection timeout
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 1 // Maintain at least 1 socket connection
    });
    
    // Store the connection in the cache
    cachedConnection = conn;
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    
    // Don't exit the process on connection failure in production
    // This allows the error to be handled gracefully in the request
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
    
    throw error; // Re-throw for handling at the API level
  }
};

module.exports = connectDB; 