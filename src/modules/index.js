const { logger } = require("../utils/logger/logger");
const articleRoutes = require("./articles/routes/article.routes");
const bannerRoutes = require("./banner/routes/banner.routes");
const reportRoutes = require("./report/routes/report.routes");
const ticketRoutes = require("./ticket/routes/ticket.route");
const userRoutes = require("./user/routes/user.routes");

const setupRoutes = async (fastify) => {
  logger.info("Routes configured");
  fastify.register(userRoutes, { prefix: "/api/users" });
  fastify.register(bannerRoutes, { prefix: "/api/banners" });
  fastify.register(reportRoutes, { prefix: "/api/reports" });
  fastify.register(ticketRoutes, { prefix: "/api/tickets" });
  fastify.register(articleRoutes, { prefix: "/api/articles" });
};

module.exports = setupRoutes;
