const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { reportService } = require("../service/report.service");
const { paginate } = require("../../../utils/pagination/paginate");
const {
  notificationService,
} = require("../../notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const reportController = {
  // ثبت ریپورت
  createReport: async (request, reply) => {
    try {
      const reporterId = request.user.id; // از توکن JWT
      const { reportedUserId, reason } = request.body;
      const report = await reportService.createReport(reporterId, request.body);

      await notificationService.createAndSendNotification(
        request.server,
        reporterId,
        NOTIFICATION_TYPES.REPORT_USER,
        `User reported: ${reportedUserId}`,
        {
          reportId: report._id.toString(),
          reportedUserId,
          reason,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Report created: ${report._id}`);
      return reply
        .status(201)
        .send(
          formatResponse(
            { message: "Report submitted successfully" },
            false,
            null,
            201
          )
        );
    } catch (error) {
      logger.error(`Error creating report: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  // بن کردن دستی
  banUser: async (request, reply) => {
    try {
      const superAdminId = request.user.id;
      const userId = request.params.id;
      const user = await reportService.banUser(userId, superAdminId);

      await notificationService.createAndSendNotification(
        request.server,
        superAdminId,
        NOTIFICATION_TYPES.BLOCK_USER,
        `User banned: ${user.email}`,
        {
          userId: user._id.toString(),
          email: user.email,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`User banned: ${user._id}`);
      return reply
        .status(200)
        .send(
          formatResponse(
            { message: `User ${user.email} banned successfully` },
            false,
            null,
            200
          )
        );
    } catch (error) {
      logger.error(`Error banning user: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  // آن بن کردن دستی
  unbanUser: async (request, reply) => {
    try {
      const superAdminId = request.user.id;
      const userId = request.params.id;
      const user = await reportService.unbanUser(userId, superAdminId);

      await notificationService.createAndSendNotification(
        request.server,
        superAdminId,
        NOTIFICATION_TYPES.UNBLOCK_USER,
        `User unbanned: ${user.email}`,
        {
          userId: user._id.toString(),
          email: user.email,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`User unbanned: ${user._id}`);
      return reply
        .status(200)
        .send(
          formatResponse(
            { message: `User ${user.email} unbanned successfully` },
            false,
            null,
            200
          )
        );
    } catch (error) {
      logger.error(`Error unbanning user: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  // لیست کاربران ریپورت شده
  getReportedUsers: async (request, reply) => {
    try {
      const { user } = request;
      const { page, perPage } = request.query;

      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(formatResponse({}, true, "Access denied", 403));
      }

      const pageNum = Math.max(parseInt(page) || 1, 1);
      const perPageNum =
        parseInt(perPage) || parseInt(process.env.USERS_PER_PAGE) || 20;

      const { users, total } = await reportService.getReportedUsers(
        pageNum,
        perPageNum
      );
      const pagination = paginate({
        total,
        page: pageNum,
        perPage: perPageNum,
      });

      return reply
        .status(200)
        .send(formatResponse({ users }, false, null, 200, pagination));
    } catch (error) {
      logger.error(`Error fetching reported users: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  // لیست کاربران بن شده
  getBannedUsers: async (request, reply) => {
    try {
      const { user } = request;
      const { page, perPage } = request.query;

      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(formatResponse({}, true, "Access denied", 403));
      }

      const pageNum = Math.max(parseInt(page) || 1, 1);
      const perPageNum =
        parseInt(perPage) || parseInt(process.env.USERS_PER_PAGE) || 20;

      const { users, total } = await reportService.getBannedUsers(
        pageNum,
        perPageNum
      );
      const pagination = paginate({
        total,
        page: pageNum,
        perPage: perPageNum,
      });

      return reply
        .status(200)
        .send(formatResponse({ users }, false, null, 200, pagination));
    } catch (error) {
      logger.error(`Error fetching banned users: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  clearReportsOfUser: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(formatResponse({}, true, "Access denied", 403));
      }
      const userId = request.params.id;
      const clearedUser = await reportService.clearReportsOfUser(userId);
      if (!clearedUser) {
        return reply
          .status(404)
          .send(formatResponse({}, true, "User not found", 404));
      }

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.CLEAR_USER_REPORTS,
        `All reports cleared for user: ${clearedUser.email}`,
        {
          userId: clearedUser._id.toString(),
          email: clearedUser.email,
          timestamp: new Date().toISOString(),
        }
      );

      return reply
        .status(200)
        .send(
          formatResponse(
            { message: "All reports of the user cleared successfully." },
            false,
            null,
            200
          )
        );
    } catch (error) {
      logger.error(`Error clearing user reports: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  // حذف همه ریپورت‌ها
  clearAllReports: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(formatResponse({}, true, "Access denied", 403));
      }
      await reportService.clearAllReports();

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.CLEAR_ALL_REPORTS,
        `All reports cleared`,
        {
          timestamp: new Date().toISOString(),
        }
      );

      return reply
        .status(200)
        .send(
          formatResponse(
            { message: "All reports cleared successfully." },
            false,
            null,
            200
          )
        );
    } catch (error) {
      logger.error(`Error clearing all reports: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  // حذف یک ریپورت خاص
  deleteSingleReport: async (request, reply) => {
    try {
      const { user } = request;
      if (user.userType !== "ADMIN" || user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(formatResponse({}, true, "Access denied", 403));
      }
      const reportId = request.params.reportId;
      const report = await reportService.getReportById(reportId);
      await reportService.deleteSingleReport(reportId);

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.DELETE_REPORT,
        `Report deleted: ${reportId}`,
        {
          reportId,
          reportedUserId: report.reportedUser.toString(),
          timestamp: new Date().toISOString(),
        }
      );

      return reply
        .status(200)
        .send(
          formatResponse(
            { message: "Report deleted successfully." },
            false,
            null,
            200
          )
        );
    } catch (error) {
      logger.error(`Error deleting single report: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { reportController };
