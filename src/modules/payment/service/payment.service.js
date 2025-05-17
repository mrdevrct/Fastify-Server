const mongoose = require("mongoose");
const Payment = require("../model/payment.model");
const Order = require("../../order/model/order.model");
const OrderStatusHistory = require("../../order/model/OrderStatusHistory.model");
const { logger } = require("../../../utils/logger/logger");

const paymentService = {
  createPayment: async (user, orderId, amount, paymentMethod) => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      if (order.userId.toString() !== user.id.toString()) {
        throw new Error("Unauthorized");
      }

      const payment = new Payment({
        orderId,
        userId: user.id,
        amount,
        paymentMethod,
        status: "PENDING",
      });

      await payment.save();
      order.paymentId = payment._id;
      await order.save();

      logger.info(`Payment ${payment._id} created for order: ${orderId}`);
      return payment;
    } catch (error) {
      logger.error(`Error creating payment: ${error.message}`);
      throw error;
    }
  },

  processPayment: async (paymentId, user) => {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      if (payment.userId.toString() !== user.id.toString()) {
        throw new Error("Unauthorized");
      }

      payment.status = "SUCCESS";
      payment.transactionId = `TXN_${Date.now()}`;
      payment.updatedAt = new Date();
      await payment.save();

      const statusHistory = new OrderStatusHistory({
        orderId: payment.orderId,
        status: "PREPARING",
        updatedBy: user.id,
        notes: "Payment successful, order preparation started",
      });
      await statusHistory.save();

      logger.info(`Payment ${paymentId} processed successfully`);
      return payment;
    } catch (error) {
      logger.error(`Error processing payment: ${error.message}`);
      throw error;
    }
  },

  getPayment: async (paymentId, user) => {
    try {
      const payment = await Payment.findById(paymentId).populate("orderId");
      if (!payment) {
        throw new Error("Payment not found");
      }
      if (payment.userId.toString() !== user.id.toString()) {
        throw new Error("Unauthorized");
      }
      return payment;
    } catch (error) {
      logger.error(`Error fetching payment: ${error.message}`);
      throw error;
    }
  },

  getUserPayments: async (user) => {
    try {
      const payments = await Payment.find({ userId: user.id })
        .populate("orderId")
        .sort({ createdAt: -1 });
      return payments;
    } catch (error) {
      logger.error(`Error fetching user payments: ${error.message}`);
      throw error;
    }
  },

  updatePaymentStatus: async (paymentId, status, transactionId, user) => {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error("Payment not found");
      }
      if (payment.userId.toString() !== user.id.toString()) {
        throw new Error("Unauthorized");
      }

      payment.status = status;
      if (transactionId) {
        payment.transactionId = transactionId;
      }
      payment.updatedAt = Date.now();
      await payment.save();

      if (status === "SUCCESS") {
        const statusHistory = new OrderStatusHistory({
          orderId: payment.orderId,
          status: "PREPARING",
          updatedBy: user.id,
          notes: "Payment confirmed, order preparation started",
        });
        await statusHistory.save();
      }

      logger.info(`Payment ${paymentId} status updated to ${status}`);
      return payment;
    } catch (error) {
      logger.error(`Error updating payment status: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { paymentService };
