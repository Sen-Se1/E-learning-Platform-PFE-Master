const http = require("http");
const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");
const { initSocket } = require("./config/socket");
const notificationRoutes = require("./routes/notification.routes");

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT || 8011;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    service: "notification-service",
    status: "running"
  });
});

app.use("/api/notifications", notificationRoutes);

async function start() {
  await connectDB();

  initSocket(server);

  server.listen(PORT, () => {
    console.log(`🚀 Notification service running on port ${PORT}`);
  });
}

start();