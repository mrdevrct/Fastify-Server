const setupApp = require("./src/app");
const { connectDB } = require("./src/configs/database");
const { logger } = require("./src/utils/logger/logger");

const start = async () => {
  try {
    await connectDB();
    const fastify = await setupApp();
    await fastify.listen({
      port: process.env.PORT || 8081,
      host: "0.0.0.0", // برای Render ضروریه
    });

    logger.info(`Server running on port ${process.env.PORT || 8081}`);
  } catch (err) {
    logger.error("Server startup error:", err);
    process.exit(1);
  }
};

start();
