const {
  notificationController,
} = require("../controller/notification.controller");
const { notificationJsonSchema } = require("../model/schema/notification.schema");

const notificationRoutes = async (fastify, options) => {
  // Get notifications
  fastify.get(
    "/",
    {
      schema: {
        description:
          "Get paginated list of notifications for the authenticated user",
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        querystring: {
          type: "object",
          properties: {
            page: {
              type: "integer",
              minimum: 1,
              default: 1,
              description: "Page number",
            },
            limit: {
              type: "integer",
              minimum: 1,
              default: 20,
              description: "Number of notifications per page",
            },
          },
        },
        response: {
          200: {
            description: "List of notifications",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  notifications: {
                    type: "array",
                    items: notificationJsonSchema,
                    description: "List of notifications",
                  },
                  total: {
                    type: "integer",
                    description: "Total number of notifications",
                  },
                  page: { type: "integer", description: "Current page number" },
                  limit: {
                    type: "integer",
                    description: "Notifications per page",
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    notificationController.getNotifications
  );

  // Mark notification as read
  fastify.put(
    "/:id/read",
    {
      schema: {
        description: "Mark a notification as read",
        tags: ["Notifications"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "Unique notification ID (notificationJson.id)",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Notification marked as read",
            type: "object",
            properties: {
              data: notificationJsonSchema,
            },
          },
          400: {
            description: "Invalid request or notification not found",
            type: "object",
            properties: {
              error: { type: "string" },
            },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    notificationController.markAsRead
  );
};

module.exports = notificationRoutes;
