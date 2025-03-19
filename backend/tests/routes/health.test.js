const request = require('supertest');
const express = require('express');
const healthRoutes = require('../../src/routes/health');

// Create an express app for testing
const app = express();
app.use('/api/health', healthRoutes);

describe('Health Route Tests', () => {
  it('should return API status with 200 status code', async () => {
    const res = await request(app).get('/api/health');
    
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('success', true);
    expect(res.body).toHaveProperty('message', 'API is running');
    expect(res.body).toHaveProperty('timestamp');
    expect(res.body).toHaveProperty('environment', 'test');
  });
}); 