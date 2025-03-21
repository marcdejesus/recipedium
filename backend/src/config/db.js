const mongoose = require('mongoose');

// Connect to MongoDB
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB connection string is missing in environment variables');
    }
    
    // Check if the connection string has the correct format
    if (!mongoURI.startsWith('mongodb://') && !mongoURI.startsWith('mongodb+srv://')) {
      throw new Error('Invalid MongoDB URI format. Must start with mongodb:// or mongodb+srv://');
    }
    
    const conn = await mongoose.connect(mongoURI, {
      useNewUrlParser: true,      // These options may not be needed in newer
      useUnifiedTopology: true    // versions of mongoose, but added for safety
    });
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB; 