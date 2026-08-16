const mongoose = require("mongoose");

/**
 * @desc    Database connection
 */
const dbConnection = () => {
  mongoose
    .connect(process.env.MONGO_URI, {
      user: process.env.MONGO_USER,
      pass: process.env.MONGO_PASSWORD,
      authSource: "admin",
    })
    .then((connect) => {
      console.log(
        `Database connected: ${connect.connection.host}:${connect.connection.port}/${connect.connection.name}`,
      );
    })
    .catch((err) => {
      console.error("Database connection error:", err);
    });
};

module.exports = dbConnection;
