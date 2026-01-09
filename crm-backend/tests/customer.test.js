const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

// Set test environment variables
process.env.JWT_SECRET = 'test_jwt_secret_key_12345';
process.env.MONGODB_URI = 'mongodb://localhost:27017/crm_test';

const Customer = require('../models/Customer');
const User = require('../models/User');
const { createCustomer, getCustomers, getCustomerById, updateCustomer, deleteCustomer } = require('../controllers/customerController');
const auth = require('../middlewares/auth');

const app = express();
app.use(bodyParser.json());

// Routes for testing
app.post('/api/customers', auth, createCustomer);
app.get('/api/customers', auth, getCustomers);
app.get('/api/customers/:id', auth, getCustomerById);
app.put('/api/customers/:id', auth, updateCustomer);
app.delete('/api/customers/:id', auth, deleteCustomer);

describe('Customer CRUD Tests', () => {
  let token;
  let userId;
  let customerId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_URI);

    // Create a test user and token
    const user = await User.create({
      firstName: 'Test',
      lastName: 'User',
      email: `test${Date.now()}@example.com`,
      password: 'hashed_password',
      role: 'user',
    });
    userId = user._id;
    token = jwt.sign({ userId: userId }, process.env.JWT_SECRET || 'test_secret', { expiresIn: '1h' });
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Customer.deleteMany({});
    await mongoose.connection.close();
  });

  describe('POST /api/customers', () => {
    it('should create a new customer', async () => {
      const res = await request(app)
        .post('/api/customers')
        .set('Authorization', token)
        .send({
          userID: userId,
          name: 'Acme Corp',
          email: 'acme@example.com',
          phoneNumber: '555-1234',
          cardReference: 'CARD-001',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body).toHaveProperty('_id');
      expect(res.body.name).toBe('Acme Corp');
      customerId = res.body._id;
    });
  });

  describe('GET /api/customers', () => {
    it('should get all customers', async () => {
      const res = await request(app)
        .get('/api/customers')
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should not get customers without token', async () => {
      const res = await request(app).get('/api/customers');

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/customers/:id', () => {
    it('should get a customer by ID', async () => {
      const res = await request(app)
        .get(`/api/customers/${customerId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body._id).toBe(customerId.toString());
      expect(res.body.name).toBe('Acme Corp');
    });

    it('should return 404 for non-existent customer', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const res = await request(app)
        .get(`/api/customers/${fakeId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/customers/:id', () => {
    it('should update a customer', async () => {
      const res = await request(app)
        .put(`/api/customers/${customerId}`)
        .set('Authorization', token)
        .send({
          name: 'Updated Acme Corp',
          email: 'updated@example.com',
        });

      expect(res.statusCode).toBe(200);
      expect(res.body.name).toBe('Updated Acme Corp');
    });
  });

  describe('DELETE /api/customers/:id', () => {
    it('should delete a customer', async () => {
      const res = await request(app)
        .delete(`/api/customers/${customerId}`)
        .set('Authorization', token);

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe('Customer deleted');
    });
  });
});
