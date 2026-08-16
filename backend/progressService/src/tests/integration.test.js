const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');

// Import app components
const mountRoutes = require('../routes');
const globalError = require('../middleware/errorMiddleware');

// Setup a test app
const app = express();
app.use(express.json());
app.use(cors());
app.use(mongoSanitize());
app.use(xss());

// Environment variables for tests
process.env.NODE_ENV = 'test';

mountRoutes(app);
app.use(globalError);

describe('Progress Service Integration Tests', () => {
  
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test-progress-db';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    // Clean up if needed
    if (mongoose.connection.db) {
       await mongoose.connection.db.dropDatabase();
    }
    await mongoose.connection.close();
  });

  describe('SUBMISSION API', () => {
    it('1. Should fetch activities (empty list initially)', async () => {
      // Providing a dummy userId to avoid 400 error from activityController.js
      const res = await request(app)
        .get('/api/v1/activities?userId=65abc1234567890123456789')
        .set('Authorization', 'Bearer test-token');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2. Should return 404/400 for non-existent submission', async () => {
      const res = await request(app)
        .get('/api/v1/submissions/65abc1234567890123456789')
        .set('Authorization', 'Bearer test-token');
      
      // Matches app.all("*") or missing routes returning 400
      expect([404, 400]).toContain(res.statusCode);
    });
  });

  describe('COURSE PROGRESS API', () => {
    it('1. Should return course progress (empty list initially)', async () => {
      const res = await request(app)
        .get('/api/v1/course-progress/650000000000000000000002')
        .set('Authorization', 'Bearer test-token');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toEqual([]);
    });

    it('2. Should return 401 for unauthorized progress fetch (no token)', async () => {
      const res = await request(app).get('/api/v1/course-progress/650000000000000000000002');
      expect(res.statusCode).toEqual(401);
    });
  });
});
