const {
  notificationController,
} = require("../controller/notification.controller");

const notificationRoutes = async (fastify, options) => {
  fastify.get(
    "/",
    { preValidation: [fastify.auth] },
    notificationController.getNotifications
  );
  fastify.put(
    "/:id/read",
    { preValidation: [fastify.auth] },
    notificationController.markAsRead
  );
};

module.exports = notificationRoutes;
