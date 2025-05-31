const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { categoryService } = require("../service/category.service");
const {
  notificationService,
} = require("../../notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const categoryController = {
  createCategory: async (request, reply) => {
    try {
      const user = request.user;
      logger.info(`User object: ${JSON.stringify(user)}`);
      if (user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "Only superadmins can create categories",
              403
            )
          );
      }

      const categoryData = {};
      let imageData = null;

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "image") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid image size", 400));
          }
          imageData = { ...part, size: fileSize, fileBuffer };
        } else if (part.type === "field") {
          categoryData[part.fieldname] = part.value;
        }
      }

      if (!categoryData.name) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Category name is required", 400));
      }

      const image = imageData
        ? (await fileUploader.uploadCategoryImage(imageData, user)).url
        : categoryData.image || "";

      const newCategory = await categoryService.createCategory(
        { ...categoryData, image },
        user
      );

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.ADD_CATEGORY,
        `New category created: ${newCategory.name}`,
        {
          categoryId: newCategory._id.toString(),
          name: newCategory.name,
          slug: newCategory.slug,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Category ${newCategory.name} created by ${user.email}`);
      return reply
        .status(201)
        .send(formatResponse(newCategory, false, null, 201));
    } catch (error) {
      logger.error(`Error creating category: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getCategories: async (request, reply) => {
    try {
      const { parentId, slug, tree } = request.query;
      const filters = { parentId, slug };
      const options = { tree: tree === "true" };

      const categories = await categoryService.getCategories(filters, options);
      return reply
        .status(200)
        .send(formatResponse(categories, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching categories: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getCategory: async (request, reply) => {
    try {
      const { identifier } = request.params;
      const category = await categoryService.getCategory(identifier);
      logger.info(`Fetched category ${identifier}`);
      return reply.status(200).send(formatResponse(category, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching category: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updateCategory: async (request, reply) => {
    try {
      const user = request.user;
      if (user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "Only superadmins can update categories",
              403
            )
          );
      }

      const { categoryId } = request.params;
      const updateData = {};
      let imageData = null;

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "image") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid image size", 400));
          }
          imageData = { ...part, size: fileSize, fileBuffer };
        } else if (part.type === "field") {
          updateData[part.fieldname] = part.value;
        }
      }

      const image = imageData
        ? (await fileUploader.uploadCategoryImage(imageData, user)).url
        : updateData.image;

      const category = await categoryService.updateCategory(
        categoryId,
        { ...updateData, image },
        user
      );

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.UPDATE_CATEGORY,
        `Category updated: ${category.name}`,
        {
          categoryId: category._id.toString(),
          name: category.name,
          slug: category.slug,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Category ${categoryId} updated by ${user.email}`);
      return reply.status(200).send(formatResponse(category, false, null, 200));
    } catch (error) {
      logger.error(`Error updating category: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  deleteCategory: async (request, reply) => {
    try {
      const user = request.user;
      if (user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "Only superadmins can delete categories",
              403
            )
          );
      }

      const { categoryId } = request.params;
      const { force, newParentId } = request.query;
      const options = { force: force === "true", newParentId };

      const category = await categoryService.getCategory(categoryId);
      await categoryService.deleteCategory(categoryId, options);

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.REMOVE_CATEGORY,
        `Category deleted: ${category.name}`,
        {
          categoryId: category._id.toString(),
          name: category.name,
          slug: category.slug,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Category ${categoryId} deleted by ${user.email}`);
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error deleting category: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { categoryController };
