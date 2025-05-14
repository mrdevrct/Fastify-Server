const setupApp = require("./app");
const { connectDB } = require("./configs/database");
const { logger } = require("./utils/logger/logger");

const start = async () => {
  try {
    await connectDB();
    const fastify = await setupApp();
    await fastify.listen({ port: process.env.PORT || 8081 });

    logger.info(`Server running on port ${process.env.PORT || 8081}`);
  } catch (err) {
    logger.error("Server startup error:", err);
    process.exit(1);
  }
};

start();
