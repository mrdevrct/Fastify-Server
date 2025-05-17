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

  // لیست کاربران ریپورت شده
  getReportedUsers: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return formatResponse({}, true, "Access denied", 403);
      }
      const users = await reportService.getReportedUsers();
      return formatResponse({ users }, false, null, 200);
    } catch (error) {
      logger.error(`Error fetching reported users: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  getBannedUsers: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return formatResponse({}, true, "Access denied", 403);
      }
      const users = await reportService.getBannedUsers();
      return formatResponse({ users }, false, null, 200);
    } catch (error) {
      logger.error(`Error fetching banned users: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  clearReportsOfUser: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return formatResponse({}, true, "Access denied", 403);
      }
      const userId = request.params.id;
      const clearedUser = await reportService.clearReportsOfUser(userId);
      if (!clearedUser) {
        return formatResponse({}, true, "User not found", 404);
      }
      return formatResponse(
        { message: "All reports of the user cleared successfully." },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error clearing user reports: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  // حذف همه ریپورت‌ها
  clearAllReports: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return formatResponse({}, true, "Access denied", 403);
      }
      await reportService.clearAllReports();
      return formatResponse(
        { message: "All reports cleared successfully." },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error clearing all reports: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  // حذف یک ریپورت خاص
  deleteSingleReport: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return formatResponse({}, true, "Access denied", 403);
      }
      const reportId = request.params.reportId;
      await reportService.deleteSingleReport(reportId);
      return formatResponse(
        { message: "Report deleted successfully." },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error deleting single report: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },
};

module.exports = { reportController };
