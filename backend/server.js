const app = require("./src/app");
const { getRedisHelper } = require("./src/helpers/redisHelper");
const PORT = process.env.PORT || 3055;

(async () => {
  try {
    const redis = getRedisHelper();
    await redis.connect();
    console.log("🚀 Redis connected successfully");

    // Start Express server
    const server = app.listen(PORT, () => {
      console.log(`server start with ${PORT}`);
    });

    // Graceful shutdown
    process.on("SIGINT", async () => {
      console.log("Received SIGINT, shutting down gracefully...");
      await redis.disconnect();
      server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
      });
    });

    process.on("SIGTERM", async () => {
      console.log("Received SIGTERM, shutting down gracefully...");
      await redis.disconnect();
      server.close(() => {
        console.log("Exit Server Express");
        process.exit(0);
      });
    });

  } catch (err) {
    console.error("❌ Failed to start server:", err.message);
    process.exit(1);
  }
})();
