const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const userRoutes = require('../../src/routes/users');
const { protect } = require('../../src/middleware/auth');
const dbHandler = require('../setup');

// Create an express app for testing
const app = express();
app.use(express.json());

// Mock the auth middleware for protected routes
app.use((req, res, next) => {
  req.user = null; // Default to no user
  next();
});

app.use('/api/users', userRoutes);

// Connect to a test database before running any tests
beforeAll(async () => await dbHandler.setUp());

// Clear all data after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests have run
afterAll(async () => await dbHandler.tearDown());

describe('User Controller Tests', () => {
  let testUser, testToken, adminUser, adminToken, user1, user2;

  beforeEach(async () => {
    // Create a regular test user
    testUser = await User.create({
      name: 'Test User',
      email: 'test@example.com',
      password: await bcrypt.hash('password123', await bcrypt.genSalt(10))
    });
    
    // Create an admin user
    adminUser = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      password: await bcrypt.hash('password123', await bcrypt.genSalt(10)),
      role: 'admin'
    });

    // Create two additional users for testing unauthorized access
    user1 = await User.create({
      name: 'User One',
      email: 'user1@example.com',
      password: await bcrypt.hash('password123', await bcrypt.genSalt(10))
    });
    
    user2 = await User.create({
      name: 'User Two',
      email: 'user2@example.com',
      password: await bcrypt.hash('password123', await bcrypt.genSalt(10))
    });

    // Generate tokens
    testToken = jwt.sign(
      { id: testUser._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );
    
    adminToken = jwt.sign(
      { id: adminUser._id },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '1h' }
    );

    // Mock the auth middleware
    jest.spyOn(require('../../src/middleware/auth'), 'protect').mockImplementation((req, res, next) => {
      const token = req.header('x-auth-token');
      
      if (!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
      }
      
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.user = { id: decoded.id };
        next();
      } catch (err) {
        res.status(401).json({ msg: 'Token is not valid' });
      }
    });

    // Mock the admin middleware
    jest.spyOn(require('../../src/middleware/auth'), 'admin').mockImplementation(async (req, res, next) => {
      try {
        const user = await User.findById(req.user.id);
        
        if (!user) {
          return res.status(404).json({ msg: 'User not found' });
        }
        
        if (user.role !== 'admin') {
          return res.status(403).json({ msg: 'Not authorized as an admin' });
        }
        
        next();
      } catch (err) {
        res.status(500).json({ msg: 'Server error' });
      }
    });
  });

  describe('GET /api/users/:id', () => {
    it('should get user profile by ID', async () => {
      const res = await request(app).get(`/api/users/${testUser._id}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body._id).toBe(testUser._id.toString());
      expect(res.body.name).toBe(testUser.name);
      expect(res.body.email).toBe(testUser.email);
      expect(res.body).not.toHaveProperty('password'); // Password should be excluded
    });

    it('should return 404 for non-existent user ID', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const res = await request(app).get(`/api/users/${nonExistentId}`);
      
      expect(res.statusCode).toBe(404);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toBe('User not found');
    });

    it('should return 400 for invalid user ID format', async () => {
      const res = await request(app).get('/api/users/invalid-id');
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/users', () => {
    it('should get all users for admin', async () => {
      const adminToken = jwt.sign(
        { id: adminUser._id, role: 'admin' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${adminToken}`);
      
      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBe(4); // Admin, test user, and 2 additional users
      
      // Check that user data is properly formatted
      const userFields = res.body.map(user => Object.keys(user));
      userFields.forEach(fields => {
        expect(fields).toContain('_id');
        expect(fields).toContain('name');
        expect(fields).toContain('email');
        expect(fields).toContain('role');
        expect(fields).not.toContain('password'); // Password should be excluded
      });
    });

    it('should not allow non-admin to get all users', async () => {
      const testToken = jwt.sign(
        { id: testUser._id, role: 'user' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${testToken}`);
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('Not authorized as an admin');
    });

    it('should not allow unauthenticated request', async () => {
      const res = await request(app).get('/api/users');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('No token');
    });
  });

  describe('PUT /api/users/:id', () => {
    it('should update user profile if user is owner', async () => {
      const testToken = jwt.sign(
        { id: testUser._id, role: 'user' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const updateData = {
        name: 'Updated Test User',
        email: 'updatedtest@example.com'
      };
      
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.email).toBe(updateData.email);
    });

    it('should update user profile if user is admin', async () => {
      const adminToken = jwt.sign(
        { id: adminUser._id, role: 'admin' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const updateData = {
        name: 'Admin Updated User',
        email: 'user1updated@example.com'
      };
      
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe(updateData.name);
      expect(res.body.email).toBe(updateData.email);
    });

    it('should not update user profile if user is not owner or admin', async () => {
      const user2Token = jwt.sign(
        { id: user2._id, role: 'user' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const updateData = {
        name: 'Unauthorized Update',
        email: 'unauthorized@example.com'
      };
      
      const res = await request(app)
        .put(`/api/users/${user1._id}`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(403);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('Not authorized');
    });

    it('should not update with invalid email format', async () => {
      const testToken = jwt.sign(
        { id: testUser._id, role: 'user' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const updateData = {
        name: 'Valid Name',
        email: 'invalid-email'
      };
      
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should handle duplicate email error', async () => {
      // Create a new user with a specific email
      await User.create({
        name: 'Duplicate Email User',
        email: 'duplicate@example.com',
        password: 'password123'
      });
      
      const testToken = jwt.sign(
        { id: testUser._id, role: 'user' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const updateData = {
        email: 'duplicate@example.com'
      };
      
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('already in use');
    });

    it('should not update with empty name', async () => {
      const testToken = jwt.sign(
        { id: testUser._id, role: 'user' },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const updateData = {
        name: ''
      };
      
      const res = await request(app)
        .put(`/api/users/${testUser._id}`)
        .set('Authorization', `Bearer ${testToken}`)
        .send(updateData);
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });
  });
}); 