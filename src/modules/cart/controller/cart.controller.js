const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { cartService } = require("../service/cart.service");

const cartController = {
  addToCart: async (request, reply) => {
    try {
      const user = request.user;
      const { productId, quantity } = request.body;

      if (!productId || !quantity || quantity < 1) {
        return reply
          .status(400)
          .send(
            formatResponse(
              {},
              true,
              "Product ID and quantity are required",
              400
            )
          );
      }

      const cart = await cartService.addToCart(user, productId, quantity);
      logger.info(`Item added to cart for user: ${user.email}`);
      return reply.status(200).send(formatResponse(cart, false, null, 200));
    } catch (error) {
      logger.error(`Error adding to cart: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getCart: async (request, reply) => {
    try {
      const user = request.user;
      const cart = await cartService.getCart(user);
      logger.info(`Cart retrieved for user: ${user.email}`);
      return reply.status(200).send(formatResponse(cart, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving cart: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  removeFromCart: async (request, reply) => {
    try {
      const user = request.user;
      const { productId } = request.body;

      if (!productId) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Product ID is required", 400));
      }

      const cart = await cartService.removeFromCart(user, productId);
      logger.info(`Item removed from cart for user: ${user.email}`);
      return reply.status(200).send(formatResponse(cart, false, null, 200));
    } catch (error) {
      logger.error(`Error removing from cart: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  clearCart: async (request, reply) => {
    try {
      const user = request.user;
      await cartService.clearCart(user);
      logger.info(`Cart cleared for user: ${user.email}`);
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error clearing cart: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { cartController };
