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
    "/users/:id/unban",
    { preValidation: [fastify.auth] },
    reportController.unbanUser
  );

  // گرفتن لیست کاربران ریپورت شده
  fastify.get(
    "/reported-users",
    { preValidation: [fastify.auth] },
    reportController.getReportedUsers
  );

  // گرفتن لیست کاربران بن شده
  fastify.get(
    "/banned-users",
    { preValidation: [fastify.auth] },
    reportController.getBannedUsers
  );

  fastify.delete(
    "/users/:id/reports",
    { preValidation: [fastify.auth] },
    reportController.clearReportsOfUser
  );

  // حذف تمام ریپورت‌ها
  fastify.delete(
    "/all-reports",
    { preValidation: [fastify.auth] },
    reportController.clearAllReports
  );

  fastify.delete(
    "/removed-report/:reportId",
    { preValidation: [fastify.auth] },
    reportController.deleteSingleReport
  );
};

module.exports = reportRoutes;
