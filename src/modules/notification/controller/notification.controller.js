const { notificationService } = require("../service/notification.service");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { logger } = require("../../../utils/logger/logger");

const notificationController = {
  getNotifications: async (request, reply) => {
    try {
      const user = request.user;
      const { page, limit } = request.query;
      const result = await notificationService.getNotifications(
        user.id,
        parseInt(page) || 1,
        parseInt(limit) || 20
      );
      return reply.status(200).send(formatResponse(result, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching notifications: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  markAsRead: async (request, reply) => {
    try {
      const user = request.user;
      const { id } = request.params;
      const notification = await notificationService.markAsRead(id, user.id);
      return reply
        .status(200)
        .send(formatResponse(notification, false, null, 200));
    } catch (error) {
      logger.error(`Error marking notification as read: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { notificationController };
