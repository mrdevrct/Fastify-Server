const { orderController } = require("../controller/order.controller");

const orderRoutes = async (fastify, options) => {
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    orderController.createOrder
  );

  fastify.get(
    "/:orderId",
    {
      preValidation: [fastify.auth],
    },
    orderController.getOrder
  );

  fastify.get(
    "/user-orders",
    {
      preValidation: [fastify.auth],
    },
    orderController.getUserOrders
  );

  fastify.put(
    "/:orderId/status",
    {
      preValidation: [fastify.auth],
    },
    orderController.updateOrderStatus
  );
};

module.exports = orderRoutes;
