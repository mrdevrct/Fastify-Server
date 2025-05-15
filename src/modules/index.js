const { logger } = require("../utils/logger/logger");
const bannerRoutes = require("./banner/routes/banner.routes");
const reportRoutes = require("./report/routes/report.routes");
const userRoutes = require("./user/routes/user.routes");

const setupRoutes = async (fastify) => {
  logger.info("Routes configured");
  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(bannerRoutes, { prefix: "/api/banners" });
  fastify.register(reportRoutes, { prefix: "/api/reports" });
};

module.exports = setupRoutes;
