const { logger } = require("../utils/logger/logger");

const setupInterceptors = async (fastify) => {
  logger.info("Interceptors configured");
};

module.exports = setupInterceptors;
