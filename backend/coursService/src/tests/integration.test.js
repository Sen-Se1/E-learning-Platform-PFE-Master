const request = require('supertest');
const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');

// Import app components - relative to src/tests/
const mountRoutes = require('../routes');
const globalError = require('../middleware/errorMiddleware');
const Course = require('../schemas/courseSchema');

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

describe('Course Service Integration Tests', () => {
  
  beforeAll(async () => {
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/test-course-db';
    await mongoose.connect(mongoUri);
  });

  afterAll(async () => {
    try {
      if (mongoose.connection && mongoose.connection.readyState !== 0) {
        if (Course.db) {
           await Course.deleteMany({});
        }
        await mongoose.connection.close();
      }
    } catch (err) {
      console.warn('Post-test cleanup warning:', err.message);
    }
  });

  describe('COURSE API', () => {
    it('1. Should fetch all courses (empty list initially)', async () => {
      const res = await request(app).get('/api/v1/courses');
      
      expect(res.statusCode).toEqual(200);
      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('2. Should return 404 for non-existent course ID or slug', async () => {
      const res = await request(app).get('/api/v1/courses/invalid-id');
      
      expect(res.statusCode).toEqual(404);
      expect(res.body.status).toBeDefined();
    });

    it('3. Should fail to create course without required data', async () => {
      const res = await request(app)
        .post('/api/v1/courses')
        .set('Authorization', 'Bearer test-token')
        .send({
          title: 'Missing other fields'
        });
      
      // Should fail with 400 due to express-validator
      expect(res.statusCode).toEqual(400);
    });
  });
});
