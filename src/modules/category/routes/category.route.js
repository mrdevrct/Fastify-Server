const { categoryController } = require("../controller/category.controller");
const { categoryJsonSchema } = require("../model/schema/category.schema");
const {
  metaSchema,
  successResponseSchema,
  errorResponseSchema,
} = require("../../../utils/response/responseSchemas");

const categoryRoutes = async (fastify, options) => {
  // Create category
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    categoryController.createCategory
  );

  // Get categories
  fastify.get(
    "/",
    categoryController.getCategories
  );

  // Get category by ID or slug
  fastify.get(
    "/:identifier",
    {
      schema: {
        description: "Get a category by ID or slug (public access)",
        tags: ["Categories"],
        params: {
          type: "object",
          properties: {
            identifier: { type: "string", description: "Category ID or slug" },
          },
          required: ["identifier"],
        },
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
        },
      },
    },
    categoryController.getCategory
  );

  // Update category
  fastify.put(
    "/:categoryId",
    {
      schema: {
        description: "Update a category (requires SUPER_ADMIN authentication)",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
        params: {
          type: "object",
          properties: {
            categoryId: { type: "string", description: "Category ID" },
          },
          required: ["categoryId"],
        },
        body: {
          type: "object",
          properties: {
            name: {
              type: "string",
              description: "Category name",
              maxLength: 100,
            },
            slug: { type: "string", description: "Unique category slug" },
            parentId: {
              type: "string",
              description: "Parent category ID",
              nullable: true,
            },
            description: {
              type: "string",
              description: "Category description",
            },
            image: {
              type: "string",
              format: "binary",
              description: "Category image file",
            },
            metaTitle: {
              type: "string",
              description: "SEO meta title",
              maxLength: 70,
            },
            metaDescription: {
              type: "string",
              description: "SEO meta description",
              maxLength: 160,
            },
          },
        },
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preValidation: [fastify.auth],
    },
    categoryController.updateCategory
  );

  // Delete category
  fastify.delete(
    "/:categoryId",
    {
      schema: {
        description: "Delete a category (requires SUPER_ADMIN authentication)",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            categoryId: { type: "string", description: "Category ID" },
          },
          required: ["categoryId"],
        },
        querystring: {
          type: "object",
          properties: {
            force: {
              type: "boolean",
              description: "Force delete even if products exist",
              default: false,
            },
            newParentId: {
              type: "string",
              description: "New parent ID for subcategories",
              nullable: true,
            },
          },
        },
        response: {
          200: successResponseSchema,
          400: errorResponseSchema,
          401: errorResponseSchema,
          403: errorResponseSchema,
        },
      },
      preValidation: [fastify.auth],
    },
    categoryController.deleteCategory
  );
};

module.exports = categoryRoutes;
