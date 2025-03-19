const mongoose = require('mongoose');
const connectDB = require('../../src/config/db');

// Mock mongoose connect and console functions
jest.mock('mongoose', () => ({
  connect: jest.fn()
}));

// Mock console methods
global.console = {
  ...global.console,
  log: jest.fn(),
  error: jest.fn()
};

// Mock process.exit
const mockExit = jest.spyOn(process, 'exit').mockImplementation(() => {});

describe('Database Connection', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should connect to the database successfully', async () => {
    // Mock successful database connection
    mongoose.connect.mockResolvedValueOnce({
      connection: {
        host: 'localhost'
      }
    });

    // Call the connectDB function
    await connectDB();

    // Check if mongoose.connect was called with the correct URI
    expect(mongoose.connect).toHaveBeenCalledWith(process.env.MONGODB_URI);
    
    // Check if success message was logged
    expect(console.log).toHaveBeenCalledWith(expect.stringContaining('MongoDB Connected'));
  });

  it('should handle connection errors', async () => {
    // Mock failed database connection
    const errorMessage = 'Connection failed';
    mongoose.connect.mockRejectedValueOnce(new Error(errorMessage));

    // Call the connectDB function
    await connectDB();

    // Check if error was logged
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining(errorMessage));
    
    // Check if process.exit was called with code 1
    expect(mockExit).toHaveBeenCalledWith(1);
  });
}); 