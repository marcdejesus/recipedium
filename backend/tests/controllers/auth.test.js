const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../../src/models/User');
const authRoutes = require('../../src/routes/auth');
const dbHandler = require('../setup');
const jwt = require('jsonwebtoken');

// Create an express app for testing
const app = express();
app.use(express.json());
app.use('/api/auth', authRoutes);

// Connect to a test database before running any tests
beforeAll(async () => await dbHandler.setUp());

// Clear all data after each test
afterEach(async () => await dbHandler.clearDatabase());

// Close database connection after all tests have run
afterAll(async () => await dbHandler.tearDown());

describe('Auth Controller Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.name).toBe('Test User');
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user).not.toHaveProperty('password');

      // Verify user was created in the database
      const user = await User.findOne({ email: 'test@example.com' });
      expect(user).toBeTruthy();
      expect(user.name).toBe('Test User');
    });

    it('should not register user with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Incomplete User',
          // Missing email
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('errors');
    });

    it('should not register user with existing email', async () => {
      // Create a user first
      await User.create({
        name: 'Existing User',
        email: 'existing@example.com',
        password: 'password123'
      });

      // Try to register with the same email
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate User',
          email: 'existing@example.com',
          password: 'newpassword'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('already exists');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user for login tests with a simple hashed password
      const user = new User({
        name: 'Login Test User',
        email: 'login@example.com',
        password: 'password123'
      });
      
      await user.save();
    });

    it('should login an existing user', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'password123'
        });
      
      console.log('Login test response:', {
        status: res.statusCode,
        body: res.body
      });
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
      expect(res.body.user).toHaveProperty('_id');
      expect(res.body.user.name).toBe('Login Test User');
      expect(res.body.user.email).toBe('login@example.com');
      expect(res.body.user).not.toHaveProperty('password');
    });

    it('should not login with invalid email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('Invalid credentials');
    });

    it('should not login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'login@example.com',
          password: 'wrongpassword'
        });
      
      expect(res.statusCode).toBe(400);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should get current user profile with valid token', async () => {
      // Create a user and get token
      const user = await User.create({
        name: 'Profile User',
        email: 'profile@example.com',
        password: 'password123'
      });
      
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET || 'testjwtsecret123456789',
        { expiresIn: '1h' }
      );
      
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);
      
      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Profile User');
      expect(res.body.email).toBe('profile@example.com');
    });

    it('should not get profile without token', async () => {
      const res = await request(app).get('/api/auth/me');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('No token');
    });

    it('should not get profile with invalid token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer invalidtoken');
      
      expect(res.statusCode).toBe(401);
      expect(res.body).toHaveProperty('msg');
      expect(res.body.msg).toContain('not valid');
    });
  });
}); 