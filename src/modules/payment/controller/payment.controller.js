const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { paymentService } = require("../service/payment.service");

const paymentController = {
  createPayment: async (request, reply) => {
    try {
      const user = request.user;
      const { orderId, amount, paymentMethod } = request.body;

      if (!orderId || !amount || !paymentMethod) {
        return reply
          .status(400)
          .send(
            formatResponse(
              {},
              true,
              "Order ID, amount, and payment method are required",
              400
            )
          );
      }

      const payment = await paymentService.createPayment({
        orderId,
        userId: user.id,
        amount,
        paymentMethod,
      });

      logger.info(
        `Payment created for order ${orderId} by user: ${user.email}`
      );
      return reply.status(201).send(formatResponse(payment, false, null, 201));
    } catch (error) {
      logger.error(`Error creating payment: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getPayment: async (request, reply) => {
    try {
      const user = request.user;
      const { paymentId } = request.params;

      const payment = await paymentService.getPayment(paymentId, user);
      logger.info(`Payment ${paymentId} retrieved for user: ${user.email}`);
      return reply.status(200).send(formatResponse(payment, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving payment: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getUserPayments: async (request, reply) => {
    try {
      const user = request.user;
      const payments = await paymentService.getUserPayments(user);
      logger.info(`Payments retrieved for user: ${user.email}`);
      return reply.status(200).send(formatResponse(payments, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving user payments: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updatePaymentStatus: async (request, reply) => {
    try {
      const user = request.user;
      const { paymentId } = request.params;
      const { status, transactionId } = request.body;

      if (!status) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Status is required", 400));
      }

      const payment = await paymentService.updatePaymentStatus(
        paymentId,
        { status, transactionId },
        user
      );
      logger.info(`Payment ${paymentId} status updated by user: ${user.email}`);
      return reply.status(200).send(formatResponse(payment, false, null, 200));
    } catch (error) {
      logger.error(`Error updating payment status: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  processPayment: async (request, reply) => {
    try {
      const user = request.user;
      const { paymentId } = request.params;

      const payment = await paymentService.processPayment(paymentId, user);
      logger.info(`Payment ${paymentId} processed for user: ${user.email}`);
      return reply.status(200).send(formatResponse(payment, false, null, 200));
    } catch (error) {
      logger.error(`Error processing payment: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { paymentController };
