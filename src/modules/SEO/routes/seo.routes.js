const { seoController } = require("../controller/seo.controller");
const {
  successResponseSchema,
  errorResponseSchema,
} = require("../../../utils/response/responseSchemas");

const seoRoutes = async (fastify, options) => {
  // Create SEO
  fastify.post(
    "/",
    {
      schema: {
        description:
          "Create SEO attributes for an entity (requires SUPER_ADMIN authentication)",
        tags: ["SEO"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            entityId: { type: "string", description: "Entity ID" },
            entityType: {
              type: "string",
              enum: ["category", "product", "page"],
              description: "Entity type",
            },
            metaTitle: { type: "string", maxLength: 70 },
            metaDescription: { type: "string", maxLength: 160 },
            canonicalUrl: { type: "string" },
            ogTitle: { type: "string", maxLength: 70 },
            ogDescription: { type: "string", maxLength: 160 },
            ogImage: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
          },
          required: ["entityId", "entityType"],
        },
        response: {
          201: successResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preValidation: [fastify.auth],
    },
    seoController.createSeo
  );

  // Get SEO
  fastify.get(
    "/:entityId/:entityType",
    {
      schema: {
        description: "Get SEO attributes for an entity (public access)",
        tags: ["SEO"],
        params: {
          type: "object",
          properties: {
            entityId: { type: "string", description: "Entity ID" },
            entityType: {
              type: "string",
              enum: ["category", "product", "page"],
              description: "Entity type",
            },
          },
          required: ["entityId", "entityType"],
        },
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    seoController.getSeo
  );

  // Update SEO
  fastify.put(
    "/:entityId/:entityType",
    {
      schema: {
        description:
          "Update SEO attributes for an entity (requires SUPER_ADMIN authentication)",
        tags: ["SEO"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            entityId: { type: "string", description: "Entity ID" },
            entityType: {
              type: "string",
              enum: ["category", "product", "page"],
              description: "Entity type",
            },
          },
          required: ["entityId", "entityType"],
        },
        body: {
          type: "object",
          properties: {
            metaTitle: { type: "string", maxLength: 70 },
            metaDescription: { type: "string", maxLength: 160 },
            canonicalUrl: { type: "string" },
            ogTitle: { type: "string", maxLength: 70 },
            ogDescription: { type: "string", maxLength: 160 },
            ogImage: { type: "string" },
            keywords: { type: "array", items: { type: "string" } },
          },
        },
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preValidation: [fastify.auth],
    },
    seoController.updateSeo
  );

  // Delete SEO
  fastify.delete(
    "/:entityId/:entityType",
    {
      schema: {
        description:
          "Delete SEO attributes for an entity (requires SUPER_ADMIN authentication)",
        tags: ["SEO"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            entityId: { type: "string", description: "Entity ID" },
            entityType: {
              type: "string",
              enum: ["category", "product", "page"],
              description: "Entity type",
            },
          },
          required: ["entityId", "entityType"],
        },
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preValidation: [fastify.auth],
    },
    seoController.deleteSeo
  );
};

module.exports = seoRoutes;
