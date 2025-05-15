const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { reportController } = require("../controller/report.controller");
const { createReportDto } = require("../dto/report.dto");

const reportRoutes = async (fastify, options) => {
  // ثبت ریپورت
  fastify.post(
    "/",
    { preValidation: [fastify.auth, validateMiddleware(createReportDto)] },
    reportController.createReport
  );

  // بن کردن دستی
  fastify.put(
    "/users/:id/ban",
    { preValidation: [fastify.auth] },
    reportController.banUser
  );

  // آن بن کردن دستی
  fastify.put(
    '/users/:id/unban',
    { preValidation: [fastify.auth] },
    reportController.unbanUser
  );
};

module.exports = reportRoutes;
