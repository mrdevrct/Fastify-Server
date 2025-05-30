const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { reportController } = require("../controller/report.controller");
const { createReportDto } = require("../dto/report.dto");
const {
  reportedUserJsonSchema,
  paginationJsonSchema,
  createReportBodySchema
} = require("../model/schema/report.schema");

const reportRoutes = async (fastify, options) => {
  // Create report
  fastify.post(
    "/",
    {
      schema: {
        description:
          "Submit a report against a user (requires user authentication)",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        body: createReportBodySchema,
        response: {
          201: {
            description: "Report submitted successfully",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Success message" },
                },
              },
            },
          },
          400: {
            description:
              "Invalid request (e.g., user already reported, invalid user ID)",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth, validateMiddleware(createReportDto)],
    },
    reportController.createReport
  );

  // Ban user
  fastify.put(
    "/users/:id/ban",
    {
      schema: {
        description:
          "Ban a user manually (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID to ban" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "User banned successfully",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Success message" },
                },
              },
            },
          },
          400: {
            description:
              "Invalid request (e.g., user not found, already banned)",
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
    reportController.banUser
  );

  // Unban user
  fastify.put(
    "/users/:id/unban",
    {
      schema: {
        description:
          "Unban a user manually (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: { type: "string", description: "User ID to unban" },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "User unbanned successfully",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Success message" },
                },
              },
            },
          },
          400: {
            description: "Invalid request (e.g., user not found, not banned)",
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
    reportController.unbanUser
  );

  // Get reported users
  fastify.get(
    "/reported-users",
    {
      schema: {
        description:
          "Get list of reported users (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
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
            perPage: {
              type: "integer",
              minimum: 1,
              default: 20,
              description: "Number of users per page",
            },
          },
        },
        response: {
          200: {
            description: "List of reported users",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  users: {
                    type: "array",
                    items: reportedUserJsonSchema,
                    description: "List of reported users",
                  },
                },
              },
              pagination: paginationJsonSchema,
            },
          },
          400: {
            description: "Invalid request (e.g., invalid query parameters)",
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
    reportController.getReportedUsers
  );

  // Get banned users
  fastify.get(
    "/banned-users",
    {
      schema: {
        description:
          "Get list of banned users (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
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
            perPage: {
              type: "integer",
              minimum: 1,
              default: 20,
              description: "Number of users per page",
            },
          },
        },
        response: {
          200: {
            description: "List of banned users",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  users: {
                    type: "array",
                    items: reportedUserJsonSchema,
                    description: "List of banned users",
                  },
                },
              },
              pagination: paginationJsonSchema,
            },
          },
          400: {
            description: "Invalid request (e.g., invalid query parameters)",
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
    reportController.getBannedUsers
  );

  // Clear reports of a user
  fastify.delete(
    "/users/:id/reports",
    {
      schema: {
        description:
          "Clear all reports for a user (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            id: {
              type: "string",
              description: "User ID whose reports to clear",
            },
          },
          required: ["id"],
        },
        response: {
          200: {
            description: "Reports cleared successfully",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Success message" },
                },
              },
            },
          },
          400: {
            description: "Invalid request",
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
          404: {
            description: "User not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    reportController.clearReportsOfUser
  );

  // Clear all reports
  fastify.delete(
    "/all-reports",
    {
      schema: {
        description: "Clear all reports (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "All reports cleared successfully",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Success message" },
                },
              },
            },
          },
          400: {
            description: "Invalid request",
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
    reportController.clearAllReports
  );

  // Delete single report
  fastify.delete(
    "/removed-report/:reportId",
    {
      schema: {
        description:
          "Delete a specific report (requires SUPER_ADMIN authentication)",
        tags: ["Reports"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            reportId: { type: "string", description: "Report ID to delete" },
          },
          required: ["reportId"],
        },
        response: {
          200: {
            description: "Report deleted successfully",
            type: "object",
            properties: {
              data: {
                type: "object",
                properties: {
                  message: { type: "string", description: "Success message" },
                },
              },
            },
          },
          400: {
            description: "Invalid request or report not found",
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
    reportController.deleteSingleReport
  );
};

module.exports = reportRoutes;
