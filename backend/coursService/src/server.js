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
const fs = require('fs');

// Ensure upload directories exist
const uploadDirs = ['uploads/images', 'uploads/videos', 'uploads/documents'];
uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});


// Connect to DB
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
  res.status(200).json({ status: "UP", service: "course-service", timestamp: new Date() });
});
// --------------------------

// Middlewares
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = [
  ...(process.env.PUBLIC_FRONTEND_URL ? process.env.PUBLIC_FRONTEND_URL.split(',') : []),
  ...(process.env.ADMIN_FRONTEND_URL ? process.env.ADMIN_FRONTEND_URL.split(',') : []),
  "http://localhost",
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
].filter(Boolean); // Remove undefined/null values

app.use(cors({
  origin: (origin, callback) => {
    // allow requests with no origin (like mobile apps or curl)
    if (!origin) return callback(null, true);
    
    // Check if origin is in allowed list or is a localhost variant
    const isAllowed = allowedOrigins.includes(origin) || 
                     origin.includes('localhost') || 
                     origin.includes('127.0.0.1') ||
                     origin.includes('192.168.100.');
                     
    if (isAllowed) {
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
app.use(express.json({ limit: "1000gb" }));
app.use(express.urlencoded({ limit: "1000gb", extended: true }));

// Data Sanitization
app.use(mongoSanitize());
app.use(xss());

if (process.env.COURSE_BACKEND_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.COURSE_BACKEND_ENV}`);
}

// Global Limit

app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Mount Routes
// Mount Routes
mountRoutes(app);

// Handle undefined routes
app.all("*", (req, res, next) => {
  next(new ApiError(`Cannot find this route: ${req.originalUrl}`, 404));
});

// Global error handling middleware
app.use(globalError);

const PORT = process.env.COURSE_BACKEND_PORT || 8001;
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
