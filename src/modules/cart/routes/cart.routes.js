const { cartController } = require("../controller/cart.controller");

const cartRoutes = async (fastify, options) => {
  // افزودن آیتم به سبد خرید
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    cartController.addToCart
  );

  // دریافت سبد خرید کاربر
  fastify.get(
    "/",
    {
      preValidation: [fastify.auth],
    },
    cartController.getCart
  );

  // حذف آیتم از سبد خرید
  fastify.delete(
    "/item",
    {
      preValidation: [fastify.auth],
    },
    cartController.removeFromCart
  );

  // پاک کردن سبد خرید
  fastify.delete(
    "/",
    {
      preValidation: [fastify.auth],
    },
    cartController.clearCart
  );
};

module.exports = cartRoutes;
