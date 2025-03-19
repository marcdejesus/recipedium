const mongoose = require('mongoose');
const User = require('../../src/models/User');
const dbHandler = require('../setup');

// Connect to a test database before running any tests
beforeAll(async () => await dbHandler.setUp());

// Clear all data after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests have run
afterAll(async () => await dbHandler.tearDown());

describe('User Model Test', () => {
  it('should create & save user successfully', async () => {
    const userData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    };
    
    const validUser = new User(userData);
    const savedUser = await validUser.save();

    // Object Id should be defined when successfully saved to MongoDB
    expect(savedUser._id).toBeDefined();
    expect(savedUser.name).toBe(userData.name);
    expect(savedUser.email).toBe(userData.email);
    // Password should be hashed and not match the original
    expect(savedUser.password).not.toBe(userData.password);
    // Role should default to 'user'
    expect(savedUser.role).toBe('user');
    // Created date should be defined
    expect(savedUser.createdAt).toBeDefined();
  });

  it('should fail validation when email is invalid', async () => {
    const userWithInvalidEmail = new User({
      name: 'Test User',
      email: 'invalid-email',
      password: 'password123'
    });

    let err;
    try {
      await userWithInvalidEmail.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.email).toBeDefined();
  });

  it('should fail when required fields are missing', async () => {
    const userWithoutRequiredFields = new User({});

    let err;
    try {
      await userWithoutRequiredFields.validate();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.errors.name).toBeDefined();
    expect(err.errors.email).toBeDefined();
    expect(err.errors.password).toBeDefined();
  });

  it('should fail when email is already in use', async () => {
    // Create a user with an email
    const firstUser = new User({
      name: 'First User',
      email: 'duplicate@example.com',
      password: 'password123'
    });
    await firstUser.save();

    // Try to create another user with the same email
    const duplicateUser = new User({
      name: 'Second User',
      email: 'duplicate@example.com',
      password: 'password456'
    });

    let err;
    try {
      await duplicateUser.save();
    } catch (error) {
      err = error;
    }
    
    expect(err).toBeDefined();
    expect(err.code).toBe(11000); // MongoDB duplicate key error code
  });
}); 