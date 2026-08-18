const express = require("express");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const path = require("path");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");
const { xss } = require("express-xss-sanitizer");
const ApiError = require("./utils/apiError");
const globalError = require("./middleware/errorMiddleware");
const dbConnection = require("./config/db");
const helmet = require("helmet");
const mountRoutes = require("./routes");
const { globalLimiter } = require("./utils/rateLimiter");

dbConnection();
const app = express();

// --- PROMETHEUS METRICS ---
const client = require('prom-client');
const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({ register: client.register });

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', client.register.contentType);
  res.end(await client.register.metrics());
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "UP", service: "user-service", timestamp: new Date() });
});
// --------------------------

// app.set('trust proxy', 1);
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const isDevelopment = process.env.USER_BACKEND_ENV === "development" || process.env.NODE_ENV === "development";

const allowedOrigins = [
  ...(process.env.PUBLIC_FRONTEND_URL ? process.env.PUBLIC_FRONTEND_URL.split(',') : []),
  ...(process.env.ADMIN_FRONTEND_URL ? process.env.ADMIN_FRONTEND_URL.split(',') : []),
  // Ngrok tunnel — added automatically from NGROK_DOMAIN env var
  ...(process.env.NGROK_DOMAIN ? [
    `https://${process.env.NGROK_DOMAIN}`,
    `http://${process.env.NGROK_DOMAIN}`,
  ] : []),
  "http://localhost",
  "https://localhost:3000",
  "http://127.0.0.1",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://127.0.0.1:3000",
  "http://127.0.0.1:3001",
  "https://192.168.100.10",
  "https://192.168.100.11",
  "https://192.168.100.12",
  "http://192.168.100.10",
  "http://192.168.100.11",
  "http://192.168.100.12"
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // In development or if no origin (like mobile apps/curl), allow everything
    if (isDevelopment || !origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`Blocked by CORS: ${origin}`);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.options("*", cors());
app.use(compression());

app.use(express.json({ limit: "20kb" }));

// Data Sanitization :
// By default, $ and . characters are removed completely from user-supplied input in the following places:
app.use(mongoSanitize());
app.use(xss());

if (process.env.USER_BACKEND_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.USER_BACKEND_ENV}`);
}

// Define /api routes
app.use("/api", globalLimiter);
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

mountRoutes(app);

app.all("*", (req, res, next) => {
  next(new ApiError(`Cannot find this route: ${req.originalUrl}`, 404));
});

// Global error handling middleware for express
app.use(globalError);

const PORT = process.env.USER_BACKEND_PORT || 8002;
const server = app.listen(PORT, () => {
  console.log(`Application running on port ${PORT}`);
});

// Handle rejection outside express
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  server.close(() => {
    console.error(`Shutting down....`);
    process.exit(1);
  });
});
