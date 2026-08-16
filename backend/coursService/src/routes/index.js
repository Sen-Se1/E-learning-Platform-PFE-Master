const courseRoute = require('./courseRoute');
const moduleRoute = require('./moduleRoute');
const lessonRoute = require('./lessonRoute');
const exerciseRoute = require('./exerciseRoute');
const reviewRoute = require('./reviewRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/courses', courseRoute);
  app.use('/api/v1/modules', moduleRoute);
  app.use('/api/v1/lessons', lessonRoute);
  app.use('/api/v1/exercises', exerciseRoute);
  app.use('/api/v1/reviews', reviewRoute);
};

module.exports = mountRoutes;
