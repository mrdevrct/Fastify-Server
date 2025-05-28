const { orderService } = require("../service/order.service");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { logger } = require("../../../utils/logger/logger");

const orderController = {
  createOrder: async (request, reply) => {
    try {
      const user = request.user;
      const { shippingAddress } = request.body;
      const order = await orderService.createOrder(user, shippingAddress);
      return reply.status(201).send(formatResponse(order, false, null, 201));
    } catch (error) {
      logger.error(`Error creating order: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getOrder: async (request, reply) => {
    try {
      const { orderId } = request.params;
      const user = request.user;
      const order = await orderService.getOrder(orderId, user);
      return reply.status(200).send(formatResponse(order, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching order: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getUserOrders: async (request, reply) => {
    try {
      const user = request.user;
      const orders = await orderService.getUserOrders(user);
      return reply.status(200).send(formatResponse(orders, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching user orders: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updateOrderStatus: async (request, reply) => {
    try {
      const { orderId } = request.params;
      const { status, notes } = request.body;
      const user = request.user;
      const statusHistory = await orderService.updateOrderStatus(
        orderId,
        status,
        user,
        notes
      );
      return reply
        .status(200)
        .send(formatResponse(statusHistory, false, null, 200));
    } catch (error) {
      logger.error(`Error updating order status: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { orderController };
