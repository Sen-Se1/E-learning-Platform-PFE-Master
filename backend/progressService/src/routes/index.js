const exerciseRoute = require('./exerciseRoute');
const courseProgressRoute = require('./courseProgressRoute');
const activityRoute = require('./activityRoute');
const { protect } = require('../middleware/authMiddleware');

const mountRoutes = (app) => {
  app.use('/api/v1/submissions', protect, exerciseRoute);
  app.use('/api/v1/course-progress', protect, courseProgressRoute);
  app.use('/api/v1/activities', protect, activityRoute);
};

module.exports = mountRoutes;
