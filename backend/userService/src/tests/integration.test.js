const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');

// Mock components to isolate tests and avoid side effects (like sending real emails)
jest.mock('../utils/emailTemplate', () => ({
  verifyEmail: jest.fn().mockResolvedValue(true),
  newLoginDetected: jest.fn().mockResolvedValue(true),
  passwordChanged: jest.fn().mockResolvedValue(true),
  forgotPassword: jest.fn().mockResolvedValue(true)
}));

// Import app components - relative to src/tests/
const mountRoutes = require('../routes');
const globalError = require('../middleware/errorMiddleware');
const User = require('../models/userModel');

// Setup a test app
const app = express();
app.use(express.json());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());

// Environment variables for tests
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET_KEY = 'test-secret-key-very-long';
process.env.JWT_EXPIRE_TIME = '1d';
process.env.PUBLIC_FRONTEND_URL = 'http://localhost:3000';

mountRoutes(app);
app.use(globalError);

describe('User Service Integration Tests', () => {
  let userToken;
  // Complete user data matching the registerValidator and register controller
  const testUser = {
    email: 'test@example.com',
    password: 'Password123!',
    passwordConfirm: 'Password123!',
    firstName: 'Tarek',
    lastName: 'Azouz',
    phone: '+21699000111',
    dateOfBirth: '1995-01-01',
    street: 'Main Street 123',
    city: 'Tunis',
    state: 'Tunis',
    country: 'TN',
    zipCode: '1000',
    role: 'student'
  };

  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test-db';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    await User.deleteMany({});
    await mongoose.connection.close();
  });

  describe('AUTH FLOW', () => {
    it('1. Should register a new user', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      // If validation fails, res.body.errors will contain info
      if (res.statusCode !== 201) {
          console.log('Registration Fail Errors:', JSON.stringify(res.body.errors, null, 2));
      }

      expect(res.statusCode).toEqual(201);
      expect(res.body.status).toBe('success');
      
      // Manually verify user in DB to allow login (bypassing email link for test)
      await User.findOneAndUpdate({ email: testUser.email }, { isVerified: true });
    });

    it('2. Should fail registration with duplicate email', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send(testUser);
      
      expect(res.statusCode).toEqual(400); 
    });

    it('3. Should login successfully and return a token', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        });
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toBeDefined();
      userToken = res.body.token;
    });

    it('4. Should fail login with wrong password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword'
        });
      
      expect(res.statusCode).toEqual(401);
    });
  });

  describe('PROTECTED ROUTES', () => {
    it('5. Should get current user profile with valid token', async () => {
      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.data.email).toBe(testUser.email);
    });

    it('6. Should deny access to profile without token', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.statusCode).toEqual(401);
    });

    it('7. Should update user profile', async () => {
      const res = await request(app)
        .put('/api/v1/auth/update-me')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          firstName: 'UpdatedName'
        });
      
      expect(res.statusCode).toEqual(200);
      // Check the path: res.body.data.profile.firstName (from user model)
      expect(res.body.data.profile.firstName).toBe('UpdatedName');
    });
  });
});
