const {
  NOTIFICATION_TYPES,
} = require("../../../../utils/notification/notification.enums");

const notificationJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string", description: "Notification MongoDB ID" },
    adminId: {
      type: "string",
      description: "ID of the admin/user receiving the notification",
    },
    notificationJson: {
      type: "object",
      properties: {
        id: { type: "string", description: "Unique notification ID" },
        status: {
          type: "string",
          enum: ["PENDING", "SENT", "FAILED"],
          default: "PENDING",
          description: "Notification status",
        },
        message: { type: "string", description: "Notification message" },
        payloadJson: {
          type: "object",
          properties: {
            commandTypeEnum: {
              type: "string",
              enum: Object.values(NOTIFICATION_TYPES),
              description:
                "Type of notification (e.g., UPDATE_USER_PROFILE, SUSPEND_USER)",
            },
            data: {
              type: "object",
              additionalProperties: true,
              description: "Additional notification data",
            },
          },
          required: ["commandTypeEnum"],
        },
      },
      required: ["id", "status", "payloadJson"],
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Notification creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Notification update timestamp",
    },
  },
  required: ["adminId", "notificationJson", "createdAt", "updatedAt"],
};

module.exports = { notificationJsonSchema };
