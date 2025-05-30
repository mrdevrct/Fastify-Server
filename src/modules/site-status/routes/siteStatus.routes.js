const { siteStatusController } = require("../controller/siteStatus.controller");
const { siteStatusJsonSchema } = require("../model/schema/siteStatus.schema");

const siteStatusRoutes = async (fastify, options) => {
  // Update site status
  fastify.post(
    "/",
    {
      schema: {
        description: "Update site status (requires SUPER_ADMIN authentication)",
        tags: ["Site Status"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: [
                "OPERATIONAL",
                "MAINTENANCE",
                "BUG",
                "SERVER_ISSUE",
                "DOWN",
              ],
              description: "Site status",
            },
            message: {
              type: "string",
              description: "Status message or description",
            },
            expectedResolutionTime: {
              type: "string",
              format: "date-time",
              description: "Expected resolution time for issues",
              nullable: true,
            },
          },
          required: ["status"],
        },
        response: {
          201: {
            description: "Site status updated successfully",
            type: "object",
            properties: {
              data: siteStatusJsonSchema,
            },
          },
          400: {
            description: "Invalid request (e.g., missing status)",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
          403: {
            description: "Forbidden: Requires SUPER_ADMIN access",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    siteStatusController.updateStatus
  );

  // Get current valid site status
  fastify.get(
    "/",
    {
      schema: {
        description: "Get current valid site status (public access)",
        tags: ["Site Status"],
        response: {
          200: {
            description: "Current valid site status",
            type: "object",
            properties: {
              data: siteStatusJsonSchema,
            },
          },
          400: {
            description: "No valid site status found",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    siteStatusController.getCurrentValidStatus
  );

  // Get site status history
  fastify.get(
    "/history",
    {
      schema: {
        description: "Get site status history (public access)",
        tags: ["Site Status"],
        querystring: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: [
                "OPERATIONAL",
                "MAINTENANCE",
                "BUG",
                "SERVER_ISSUE",
                "DOWN",
              ],
              description: "Filter by status",
            },
            fromDate: {
              type: "string",
              format: "date-time",
              description: "Filter statuses from this date",
            },
            toDate: {
              type: "string",
              format: "date-time",
              description: "Filter statuses until this date",
            },
            limit: {
              type: "integer",
              description: "Limit number of results",
              default: 50,
            },
          },
        },
        response: {
          200: {
            description: "Site status history",
            type: "object",
            properties: {
              data: {
                type: "array",
                items: siteStatusJsonSchema,
              },
            },
          },
          400: {
            description: "Invalid request",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
    siteStatusController.getStatusHistory
  );
};

module.exports = siteStatusRoutes;
