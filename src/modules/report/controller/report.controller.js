const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { reportService } = require("../service/report.service");

const reportController = {
  // ثبت ریپورت
  createReport: async (request, reply) => {
    try {
      const reporterId = request.user.id; // از توکن JWT
      const report = await reportService.createReport(reporterId, request.body);
      logger.info(`Report created: ${report._id}`);
      return formatResponse(
        { message: "Report submitted successfully" },
        false,
        null,
        201
      );
    } catch (error) {
      logger.error(`Error creating report: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  // بن کردن دستی
  banUser: async (request, reply) => {
    try {
      const superAdminId = request.user.id;
      const userId = request.params.id;
      const user = await reportService.banUser(userId, superAdminId);
      logger.info(`User banned: ${user._id}`);
      return formatResponse(
        { message: `User ${user.email} banned successfully` },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error banning user: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  // آن بن کردن دستی
  unbanUser: async (request, reply) => {
    try {
      const superAdminId = request.user.id;
      const userId = request.params.id;
      const user = await reportService.unbanUser(userId, superAdminId);
      logger.info(`User unbanned: ${user._id}`);
      return formatResponse(
        { message: `User ${user.email} unbanned successfully` },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error unbanning user: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },
};

module.exports = { reportController };
