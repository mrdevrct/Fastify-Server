const { categoryController } = require("../controller/category.controller");
const { categoryJsonSchema } = require("../model/schema/category.schema");

const categoryRoutes = async (fastify, options) => {
  // Create category
  fastify.post(
    "/",
    {
      schema: {
        description:
          "Create a new category (requires SUPER_ADMIN authentication)",
        tags: ["Categories"],
        security: [{ bearerAuth: [] }],
        consumes: ["multipart/form-data"],
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
          required: ["name"],
        },
        response: {
          201: {
            description: "Category created successfully",
            type: "object",
            properties: {
              data: categoryJsonSchema,
            },
          },
          400: {
            description: "Invalid request (e.g., missing name, invalid image)",
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
    categoryController.createCategory
  );

  // Get categories
  fastify.get(
    "/",
    {
      schema: {
        description:
          "Get list of categories with optional filters (public access)",
        tags: ["Categories"],
        querystring: {
          type: "object",
          properties: {
            parentId: {
              type: "string",
              description: "Filter by parent category ID",
              nullable: true,
            },
            slug: { type: "string", description: "Filter by category slug" },
            tree: {
              type: "boolean",
              description: "Return categories as a tree structure",
              default: false,
            },
          },
        },
        response: {
          200: {
            description: "List of categories",
            type: "object",
            properties: {
              data: {
                type: "array",
                items: {
                  ...categoryJsonSchema,
                  properties: {
                    ...categoryJsonSchema.properties,
                    children: {
                      type: "array",
                      items: categoryJsonSchema,
                      description: "Subcategories (if tree=true)",
                    },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request (e.g., invalid query parameters)",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
    },
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
          200: {
            description: "Category details",
            type: "object",
            properties: { data: categoryJsonSchema },
          },
          400: {
            description: "Invalid request or category not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
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
          200: {
            description: "Category updated successfully",
            type: "object",
            properties: { data: categoryJsonSchema },
          },
          400: {
            description: "Invalid request or category not found",
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
          200: {
            description: "Category deleted successfully",
            type: "object",
            properties: { data: {} },
          },
          400: {
            description: "Invalid request or category not found",
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
    categoryController.deleteCategory
  );
};

module.exports = categoryRoutes;
