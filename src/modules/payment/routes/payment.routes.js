const { paymentController } = require("../controller/payment.controller");

const paymentRoutes = async (fastify, options) => {
  // ایجاد پرداخت
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    paymentController.createPayment
  );

  // دریافت پرداخت
  fastify.get(
    "/:paymentId",
    {
      preValidation: [fastify.auth],
    },
    paymentController.getPayment
  );

  // دریافت تمام پرداخت‌های کاربر
  fastify.get(
    "/user-payments",
    {
      preValidation: [fastify.auth],
    },
    paymentController.getUserPayments
  );

  // به‌روزرسانی وضعیت پرداخت
  fastify.put(
    "/:paymentId/status",
    {
      preValidation: [fastify.auth],
    },
    paymentController.updatePaymentStatus
  );

  // پردازش پرداخت (ادغام با درگاه)
  fastify.post(
    "/:paymentId/process",
    {
      preValidation: [fastify.auth],
    },
    paymentController.processPayment
  );
};

module.exports = paymentRoutes;
