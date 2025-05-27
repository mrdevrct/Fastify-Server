const { logger } = require("../utils/logger/logger");
const articleRoutes = require("./articles/routes/article.routes");
const bannerRoutes = require("./banner/routes/banner.routes");
const cartRoutes = require("./cart/routes/cart.routes");
const categoryRoutes = require("./category/routes/category.route");
const festivalRoutes = require("./festival/routes/festival.routes");
const orderRoutes = require("./order/routes/order.routes");
const paymentRoutes = require("./payment/routes/payment.routes");
const productRoutes = require("./product/routes/product.routes");
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
  fastify.register(productRoutes, { prefix: "/api/products" });

  fastify.register(cartRoutes, { prefix: "/api/cart" });
  fastify.register(paymentRoutes, { prefix: "/api/payments" });
  fastify.register(orderRoutes, { prefix: "/api/orders" });
  fastify.register(festivalRoutes, { prefix: "/api/festivals" });
  fastify.register(categoryRoutes, { prefix: "/api/categories" });

};

module.exports = setupRoutes;
