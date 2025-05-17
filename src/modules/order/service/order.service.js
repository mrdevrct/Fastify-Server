const mongoose = require("mongoose");
const Order = require("../model/order.model");
const OrderStatusHistory = require("../model/OrderStatusHistory.model");
const Cart = require("../../cart/model/cart.model");
const Product = require("../../product/model/product.model");
const Festival = require("../../festival/model/festival.model");
const { cartService } = require("../../cart/service/cart.service");
const { logger } = require("../../../utils/logger/logger");

const orderService = {
  createOrder: async (user, shippingAddress) => {
    try {
      const cart = await Cart.findOne({ userId: user.id }).populate(
        "items.productId"
      );
      if (!cart || cart.items.length === 0) {
        throw new Error("Cart is empty");
      }

      for (const item of cart.items) {
        const product = item.productId;
        if (!product || product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for product ${product?.name || item.productId}`
          );
        }
      }

      let festival = null;
      const now = new Date();
      for (const item of cart.items) {
        const foundFestival = await Festival.findOne({
          products: item.productId,
          status: "ACTIVE",
          startDate: { $lte: now },
          endDate: { $gte: now },
        });
        if (foundFestival) {
          festival = foundFestival;
          break;
        }
      }

      const orderItems = cart.items.map((item) => {
        let discountPrice = item.discountPrice || item.price;
        if (festival) {
          discountPrice = item.price * (1 - festival.discountPercentage / 100);
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          discountPrice,
        };
      });

      const totalPrice = orderItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      );
      const totalDiscountPrice = orderItems.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      );

      const order = new Order({
        userId: user.id,
        items: orderItems,
        totalPrice,
        totalDiscountPrice,
        festivalId: festival ? festival._id : null,
        shippingAddress,
      });

      // کاهش موجودی محصولات
      for (const item of cart.items) {
        const updatedProduct = await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stock: -item.quantity } },
          { new: true }
        );
        if (!updatedProduct || updatedProduct.stock < 0) {
          throw new Error(`Stock update failed for product ${item.productId}`);
        }
      }

      // پاک کردن سبد خرید
      await cartService.clearCart(user);

      // ذخیره سفارش
      await order.save();

      // ثبت وضعیت اولیه
      const statusHistory = new OrderStatusHistory({
        orderId: order._id,
        status: "PENDING",
        updatedBy: user.id,
        notes: "Order created",
      });
      await statusHistory.save();

      logger.info(`Order ${order._id} created for user: ${user.email}`);
      return order;
    } catch (error) {
      logger.error(`Error creating order: ${error.message}`);
      // در صورت خطا، موجودی محصولات را به حالت اولیه برگردانید
      try {
        for (const item of cart?.items || []) {
          await Product.findByIdAndUpdate(item.productId, {
            $inc: { stock: item.quantity },
          });
        }
      } catch (rollbackError) {
        logger.error(`Rollback failed: ${rollbackError.message}`);
      }
      throw error;
    }
  },

  getOrder: async (orderId, user) => {
    try {
      const order = await Order.findById(orderId)
        .populate("items.productId")
        .populate("festivalId")
        .populate("paymentId");
      if (!order) {
        throw new Error("Order not found");
      }
      if (order.userId.toString() !== user.id.toString()) {
        throw new Error("Unauthorized");
      }

      const statusHistory = await OrderStatusHistory.find({ orderId })
        .sort({ createdAt: -1 })
        .populate("updatedBy");
      order.statusHistory = statusHistory;
      order.currentStatus = statusHistory[0]?.status || "PENDING";

      return order;
    } catch (error) {
      logger.error(`Error fetching order: ${error.message}`);
      throw error;
    }
  },

  getUserOrders: async (user) => {
    try {
      const orders = await Order.find({ userId: user.id })
        .populate("items.productId")
        .populate("festivalId")
        .populate("paymentId")
        .sort({ createdAt: -1 });

      for (let order of orders) {
        const statusHistory = await OrderStatusHistory.find({
          orderId: order._id,
        })
          .sort({ createdAt: -1 })
          .populate("updatedBy");
        order.statusHistory = statusHistory;
        order.currentStatus = statusHistory[0]?.status || "PENDING";
      }

      return orders;
    } catch (error) {
      logger.error(`Error fetching user orders: ${error.message}`);
      throw error;
    }
  },

  updateOrderStatus: async (orderId, status, user, notes = "") => {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error("Order not found");
      }
      if (
        order.userId.toString() !== user.id.toString() &&
        user.role !== "SUPERADMIN"
      ) {
        throw new Error("Unauthorized");
      }

      const validStatuses = [
        "PENDING",
        "PREPARING",
        "SHIPPED_FROM_WAREHOUSE",
        "IN_TRANSIT",
        "DELIVERED",
        "CANCELLED",
      ];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid status");
      }

      if (status === "CANCELLED") {
        for (const item of order.items) {
          const updatedProduct = await Product.findByIdAndUpdate(
            item.productId,
            { $inc: { stock: item.quantity } },
            { new: true }
          );
          if (!updatedProduct) {
            throw new Error(
              `Stock update failed for product ${item.productId}`
            );
          }
        }
      }

      const statusHistory = new OrderStatusHistory({
        orderId,
        status,
        updatedBy: user.id,
        notes,
      });
      await statusHistory.save();

      logger.info(
        `Order ${orderId} status updated to ${status} by user: ${user.email}`
      );
      return statusHistory;
    } catch (error) {
      logger.error(`Error updating order status: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { orderService };
