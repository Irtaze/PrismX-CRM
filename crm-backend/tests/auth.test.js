const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/crm_test';

const { register, login } = require('../controllers/authController');

const app = express();

app.use(bodyParser.json());

// Routes for testing
app.post('/api/users/register', register);
app.post('/api/users/login', login);

describe('User Authentication Tests', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI);
  });

  afterAll(async () => {
    // Clean up database
    await mongoose.connection.close();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user', async () => {
      const res = await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: `john${Date.now()}@example.com`,
          password: 'password123',
          role: 'user',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not register a user with existing email', async () => {
      const email = `jane${Date.now()}@example.com`;
      await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: email,
          password: 'password123',
          role: 'user',
        });

      const res = await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          email: email,
          password: 'password123',
          role: 'user',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('User already exists');
    });
  });

  describe('POST /api/users/login', () => {
    let testEmail;

    beforeEach(async () => {
      testEmail = `test${Date.now()}@example.com`;
      // Create a test user
      await request(app)
        .post('/api/users/register')
        .send({
          firstName: 'Test',
          lastName: 'User',
          email: testEmail,
          password: 'password123',
          role: 'user',
        });
    });

    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testEmail,
          password: 'password123',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body).toHaveProperty('token');
    });

    it('should not login with incorrect credentials', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: testEmail,
          password: 'wrongpassword',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });

    it('should not login with non-existent user', async () => {
      const res = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: 'password123',
        });

      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('Invalid credentials');
    });
  });
});
