const mongoose = require("mongoose");
const Notification = require("../model/notification.model");
const { logger } = require("../../../utils/logger/logger");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const notificationService = {
  createAndSendNotification: async (
    fastify,
    adminId,
    commandType,
    message,
    data
  ) => {
    try {
      // ایجاد نوتیفیکیشن
      const notification = new Notification({
        adminId,
        notificationJson: {
          id: new mongoose.Types.ObjectId().toString(),
          status: "PENDING",
          message,
          payloadJson: {
            commandTypeEnum: commandType,
            data,
          },
        },
      });

      // ذخیره در دیتابیس
      await notification.save();
      logger.info(
        `Notification saved: ${commandType}, ID: ${notification.notificationJson.id}`
      );

      // تبدیل سند به JSON ساده و تبدیل ObjectId‌ها به رشته
      const notificationJson = notification.toJSON();
      notificationJson._id = notificationJson._id.toString();
      notificationJson.adminId = notificationJson.adminId.toString();

      // ارسال کل سند از طریق WebSocket
      try {
        fastify.websocketServer.clients.forEach((client) => {
          if (client.readyState === 1) {
            client.send(JSON.stringify(notificationJson));
          }
        });
        // به‌روزرسانی وضعیت به SENT
        notification.notificationJson.status = "SENT";
        await notification.save();
        logger.info(`Notification sent via WebSocket: ${commandType}`);
      } catch (error) {
        // در صورت خطا در ارسال، وضعیت به FAILED تغییر کند
        notification.notificationJson.status = "FAILED";
        await notification.save();
        logger.error(`Error sending WebSocket notification: ${error.message}`);
      }

      return notification;
    } catch (error) {
      logger.error(`Error in createAndSendNotification: ${error.message}`);
      throw error;
    }
  },

  getNotifications: async (adminId, page = 1, limit = 20) => {
    try {
      const query = { adminId };
      const skip = (page - 1) * limit;

      const [notifications, total] = await Promise.all([
        Notification.find(query)
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit)
          .lean(),
        Notification.countDocuments(query),
      ]);

      return { notifications, total, page, limit };
    } catch (error) {
      logger.error(`Error fetching notifications: ${error.message}`);
      throw error;
    }
  },

  markAsRead: async (notificationId, adminId) => {
    try {
      const notification = await Notification.findOneAndUpdate(
        {
          "notificationJson.id": notificationId,
          adminId,
        },
        { $set: { "notificationJson.status": "SENT" } },
        { new: true }
      );
      if (!notification) {
        throw new Error("Notification not found or not authorized");
      }
      logger.info(`Notification marked as read: ${notificationId}`);
      return notification;
    } catch (error) {
      logger.error(`Error marking notification as read: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { notificationService };
