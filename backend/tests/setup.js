const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoServer;

// Set env variables for testing
process.env.JWT_SECRET = 'testjwtsecret123456789';
process.env.NODE_ENV = 'test';

// Connect to the test database before all tests
module.exports.setUp = async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  await mongoose.connect(mongoUri);
};

// Tear down database connection after all tests
module.exports.tearDown = async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
};

// Clear collections between tests
module.exports.clearDatabase = async () => {
  const collections = mongoose.connection.collections;
  
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
}; 