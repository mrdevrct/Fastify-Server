const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { festivalController } = require("../controller/festival.controller");
const { festivalJsonSchema } = require("../model/schema/festival.schema");

const festivalRoutes = async (fastify, options) => {
  // Create festival
  fastify.post(
    "/",
    {
      schema: {
        description:
          "Create a new festival (requires SUPER_ADMIN authentication)",
        tags: ["Festivals"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        body: {
          type: "object",
          properties: {
            title: { type: "string", description: "Festival title" },
            slug: {
              type: "string",
              description: "Unique festival slug",
              nullable: true,
            },
            description: {
              type: "string",
              description: "Festival description",
            },
            bannerImage: {
              type: "string",
              format: "binary",
              description: "Festival banner image file",
            },
            discountPercentage: {
              type: "number",
              description: "Discount percentage",
            },
            startDate: {
              type: "string",
              format: "date-time",
              description: "Festival start date",
            },
            endDate: {
              type: "string",
              format: "date-time",
              description: "Festival end date",
            },
            products: {
              type: "array",
              items: { type: "string" },
              description: "List of product IDs",
              nullable: true,
            },
            category: {
              type: "string",
              description: "Festival category",
              nullable: true,
            },
            metaTitle: {
              type: "string",
              description: "SEO meta title",
              nullable: true,
            },
            metaDescription: {
              type: "string",
              description: "SEO meta description",
              nullable: true,
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE"],
              description: "Festival status",
              nullable: true,
            },
          },
          required: [
            "title",
            "description",
            "discountPercentage",
            "startDate",
            "endDate",
            "bannerImage",
          ],
        },
        response: {
          201: {
            description: "Festival created successfully",
            type: "object",
            properties: {
              data: festivalJsonSchema,
            },
          },
          400: {
            description:
              "Invalid request (e.g., missing required fields, invalid image)",
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
    festivalController.createFestival
  );

  // Get all festivals
  fastify.get(
    "/",
    {
      schema: {
        description: "Get all festivals (requires user authentication)",
        tags: ["Festivals"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of festivals",
            type: "object",
            properties: {
              data: {
                type: "array",
                items: festivalJsonSchema,
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
        },
      },
      preValidation: [fastify.auth],
    },
    festivalController.getAllFestivals
  );

  // Get festival by ID or slug
  fastify.get(
    "/:identifier",
    {
      schema: {
        description:
          "Get a festival by ID or slug (requires user authentication)",
        tags: ["Festivals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            identifier: { type: "string", description: "Festival ID or slug" },
          },
          required: ["identifier"],
        },
        response: {
          200: {
            description: "Festival details",
            type: "object",
            properties: {
              data: festivalJsonSchema,
            },
          },
          400: {
            description: "Invalid request or festival not found",
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
      preValidation: [fastify.auth],
    },
    festivalController.getFestival
  );

  // Update festival
  fastify.put(
    "/:festivalId",
    {
      schema: {
        description: "Update a festival (requires SUPER_ADMIN authentication)",
        tags: ["Festivals"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        params: {
          type: "object",
          properties: {
            festivalId: { type: "string", description: "Festival ID" },
          },
          required: ["festivalId"],
        },
        body: {
          type: "object",
          properties: {
            title: {
              type: "string",
              description: "Festival title",
              nullable: true,
            },
            slug: {
              type: "string",
              description: "Unique festival slug",
              nullable: true,
            },
            description: {
              type: "string",
              description: "Festival description",
              nullable: true,
            },
            bannerImage: {
              type: "string",
              format: "binary",
              description: "Festival banner image file",
              nullable: true,
            },
            discountPercentage: {
              type: "number",
              description: "Discount percentage",
              nullable: true,
            },
            startDate: {
              type: "string",
              format: "date-time",
              description: "Festival start date",
              nullable: true,
            },
            endDate: {
              type: "string",
              format: "date-time",
              description: "Festival end date",
              nullable: true,
            },
            products: {
              type: "array",
              items: { type: "string" },
              description: "List of product IDs",
              nullable: true,
            },
            category: {
              type: "string",
              description: "Festival category",
              nullable: true,
            },
            metaTitle: {
              type: "string",
              description: "SEO meta title",
              nullable: true,
            },
            metaDescription: {
              type: "string",
              description: "SEO meta description",
              nullable: true,
            },
            status: {
              type: "string",
              enum: ["ACTIVE", "INACTIVE"],
              description: "Festival status",
              nullable: true,
            },
          },
        },
        response: {
          200: {
            description: "Festival updated successfully",
            type: "object",
            properties: {
              data: festivalJsonSchema,
            },
          },
          400: {
            description: "Invalid request or festival not found",
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
    festivalController.updateFestival
  );

  // Delete festival
  fastify.delete(
    "/:festivalId",
    {
      schema: {
        description: "Delete a festival (requires SUPER_ADMIN authentication)",
        tags: ["Festivals"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            festivalId: { type: "string", description: "Festival ID" },
          },
          required: ["festivalId"],
        },
        response: {
          200: {
            description: "Festival deleted successfully",
            type: "object",
            properties: {
              data: {},
            },
          },
          400: {
            description: "Invalid request or festival not found",
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
    festivalController.deleteFestival
  );
};

module.exports = festivalRoutes;
