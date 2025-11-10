const express = require("express");
const morgan = require("morgan");
const helmet = require("helmet");
const compression = require("compression");
const { getRateLimiter, presets } = require("./helpers/rateLimit");
const cookieParser = require("cookie-parser");
const { setupSwagger } = require("./configs/swagger.config");
const cors = require("cors");
const { getRedisHelper } = require("./helpers/redisHelper");

const app = express();
app.use(morgan("dev"));
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
//cors
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001",
    ],
    credentials: true, // Enable cookies
  })
);
//db
require("./dbs/init.mongodb");
// Register all models (for population)
require("./models");
//redis
const initRedis = async () => {
  try {
    const redis = getRedisHelper();
    await redis.connect();
    console.log('✅ Redis initialized for rate limiter');
  } catch (error) {
    console.error('⚠️  Redis connection failed, rate limiter may not work:', error.message);
    // App vẫn chạy được nếu Redis fail
  }
};

// Init Redis (không block app start)
initRedis();

//limit
const rateLimiter = getRateLimiter();
// app.use(rateLimiter.middlewareWithLists());

app.use("/", require("./routes"));
setupSwagger(app);
app.use((req, res, next) => {
  const err = new Error("not found");
  err.status = 404;
  next(err);
});

app.use((error, req, res, next) => {
  const statusCode = error.code || 500;
  return res.status(statusCode).json({
    status: "error",
    code: statusCode,
    message: error.message || "internal error",
  });
});
module.exports = app;
