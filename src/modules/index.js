const { logger } = require("../utils/logger/logger");
const userRoutes = require("./user/routes/user.routes");

const setupRoutes = async (fastify) => {
  logger.info("Routes configured");
  fastify.register(userRoutes, { prefix: "/api/users" });
};

module.exports = setupRoutes;
