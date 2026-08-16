const mongoose = require('mongoose');

/**
 * @desc    Database connection
 */
const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then((connect) => {
      console.log(`Database connected: ${connect.connection.host}:${connect.connection.port}/${connect.connection.name}`);
    })
    .catch((err) => {
      console.error(`Database Error: ${err}`);
      process.exit(1);
    });
};

module.exports = dbConnection;
