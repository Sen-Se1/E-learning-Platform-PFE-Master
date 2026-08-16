const inscriptionRoute = require('./inscriptionRoute');

const mountRoutes = (app) => {
  app.use('/api/v1/inscriptions', inscriptionRoute);
};

module.exports = mountRoutes;
