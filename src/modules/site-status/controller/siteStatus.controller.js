const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { siteStatusService } = require("../service/siteStatus.service");
const {
  notificationService,
} = require("../../notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const siteStatusController = {
  updateStatus: async (request, reply) => {
    try {
      const user = request.user;
      if (user.userType !== "ADMIN" && user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "Only superadmins can update site status",
              403
            )
          );
      }

      const { status, message, expectedResolutionTime } = request.body;

      if (!status) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Status is required", 400));
      }

      const statusData = await siteStatusService.createOrUpdateStatus(
        { status, message, expectedResolutionTime },
        user
      );

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.SITE_STATUS_UPDATE,
        `Site status updated to: ${statusData.status}`,
        {
          statusId: statusData._id.toString(),
          status: statusData.status,
          message: statusData.message,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(
        `Site status updated to ${statusData.status} by ${user.email}`
      );
      return reply
        .status(201)
        .send(formatResponse(statusData, false, null, 201));
    } catch (error) {
      logger.error(`Error updating site status: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getCurrentValidStatus: async (request, reply) => {
    try {
      const status = await siteStatusService.getCurrentValidStatus();
      logger.info(`Fetched current valid site status: ${status.status}`);
      return reply.status(200).send(formatResponse(status, false, null, 200));
    } catch (error) {
      logger.error(
        `Error fetching current valid site status: ${error.message}`
      );
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getStatusHistory: async (request, reply) => {
    try {
      const { status, fromDate, toDate, limit } = request.query;
      const filters = { status, fromDate, toDate };
      const options = { limit: parseInt(limit) || 50 };

      const statuses = await siteStatusService.getStatusHistory(
        filters,
        options
      );
      logger.info(`Fetched site status history`);
      return reply.status(200).send(formatResponse(statuses, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching site status history: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { siteStatusController };
