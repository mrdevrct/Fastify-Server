const { logger } = require("../utils/logger/logger");
const setupSecurityMiddlewares = require("./security/security.middleware");

const setupMiddlewares = async (fastify) => {
  logger.info("Middlewares configured");
  await setupSecurityMiddlewares(fastify);
};

module.exports = setupMiddlewares;
