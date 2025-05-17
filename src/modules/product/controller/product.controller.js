const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { productService } = require("../service/product.service");

const productController = {
  createProduct: async (request, reply) => {
    try {
      const user = request.user;
      const productData = {};
      let mainImageData = null;
      let mediaData = [];

      // پردازش داده‌های multipart/form-data
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file") {
          if (part.fieldname === "mainImage") {
            const fileBuffer = await part.toBuffer();
            const fileSize = fileBuffer.length;
            if (!fileSize) {
              return reply
                .status(400)
                .send(formatResponse({}, true, "Invalid main image size", 400));
            }
            mainImageData = { ...part, size: fileSize, fileBuffer };
          } else if (part.fieldname === "media") {
            const fileBuffer = await part.toBuffer();
            const fileSize = fileBuffer.length;
            if (!fileSize) {
              return reply
                .status(400)
                .send(formatResponse({}, true, "Invalid media file size", 400));
            }
            mediaData.push({ ...part, size: fileSize, fileBuffer });
          }
        } else if (part.type === "field") {
          if (part.fieldname.endsWith("[]")) {
            const fieldName = part.fieldname.slice(0, -2);
            productData[fieldName] = productData[fieldName] || [];
            productData[fieldName].push(part.value);
          } else {
            productData[part.fieldname] = part.value;
          }
        }
      }

      // اعتبارسنجی فیلدهای اجباری
      if (
        !productData.name ||
        !productData.description ||
        !productData.price ||
        productData.stock == null
      ) {
        return reply
          .status(400)
          .send(
            formatResponse(
              {},
              true,
              "Name, description, price, and stock are required",
              400
            )
          );
      }

      // تولید slug اگر غایب باشد
      if (!productData.slug) {
        productData.slug = productData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // اعتبارسنجی تصویر اصلی
      if (!mainImageData && !productData.mainImage) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Main image is required", 400));
      }

      // محدودیت تعداد رسانه‌ها
      if (mediaData.length > 10) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Maximum 10 media files allowed", 400)
          );
      }

      // آپلود تصویر اصلی
      const mainImage = mainImageData
        ? await fileUploader.uploadProductMainImage(mainImageData, user)
        : productData.mainImage;

      // آپلود رسانه‌ها
      const media =
        mediaData.length > 0
          ? await fileUploader.uploadProductMedia(
              mediaData,
              user,
              productData._id
            )
          : productData.media || [];

      // ایجاد محصول
      const newProduct = await productService.createProduct(
        { ...productData, mainImage, media },
        user
      );

      logger.info(`Product created by user: ${user.email}`);
      return reply
        .status(201)
        .send(formatResponse(newProduct, false, null, 201));
    } catch (error) {
      logger.error(`Error creating product: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getMyProducts: async (request, reply) => {
    try {
      const user = request.user;
      const products = await productService.getMyProducts(user);
      logger.info(`Products retrieved for user ${user.email}`);
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving user products: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getAllProducts: async (request, reply) => {
    try {
      const user = request.user;
      const products = await productService.getAllProducts();
      logger.info(`All products retrieved by user ${user.email}`);
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving all products: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getProduct: async (request, reply) => {
    try {
      const user = request.user;
      const { identifier } = request.params;
      const product = await productService.getProduct(identifier, user);
      await product.incrementViews();
      logger.info(`Product ${identifier} retrieved by ${user.email}`);
      return reply.status(200).send(formatResponse(product, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching product: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updateProduct: async (request, reply) => {
    try {
      const user = request.user;
      const { productId } = request.params;
      const updateData = {};
      let mainImageData = null;
      let mediaData = [];

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file") {
          if (part.fieldname === "mainImage") {
            const fileBuffer = await part.toBuffer();
            const fileSize = fileBuffer.length;
            if (!fileSize) {
              return reply
                .status(400)
                .send(formatResponse({}, true, "Invalid main image size", 400));
            }
            mainImageData = { ...part, size: fileSize, fileBuffer };
          } else if (part.fieldname === "media") {
            const fileBuffer = await part.toBuffer();
            const fileSize = fileBuffer.length;
            if (!fileSize) {
              return reply
                .status(400)
                .send(formatResponse({}, true, "Invalid media file size", 400));
            }
            mediaData.push({ ...part, size: fileSize, fileBuffer });
          }
        } else if (part.type === "field") {
          if (part.fieldname.endsWith("[]")) {
            const fieldName = part.fieldname.slice(0, -2);
            updateData[fieldName] = updateData[fieldName] || [];
            updateData[fieldName].push(part.value);
          } else {
            updateData[part.fieldname] = part.value;
          }
        }
      }

      // تولید slug اگر غایب باشد و نام محصول تغییر کرده باشد
      if (updateData.name && !updateData.slug) {
        updateData.slug = updateData.name
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      let mainImage = updateData.mainImage;
      if (mainImageData) {
        mainImage = await fileUploader.uploadProductMainImage(
          mainImageData,
          user
        );
      }

      let media = updateData.media || [];
      if (mediaData.length > 0) {
        const uploadedMedia = await fileUploader.uploadProductMedia(
          mediaData,
          user,
          productId
        );
        media = [...media, ...uploadedMedia];
      }

      const product = await productService.updateProduct(
        productId,
        { ...updateData, mainImage, media },
        user
      );

      logger.info(`Product ${productId} updated by user ${user.email}`);
      return reply.status(200).send(formatResponse(product, false, null, 200));
    } catch (error) {
      logger.error(`Error updating product: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  deleteProduct: async (request, reply) => {
    try {
      const user = request.user;
      const { productId } = request.params;
      await productService.deleteProduct(productId, user);
      logger.info(`Product ${productId} deleted by user ${user.email}`);
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error deleting product: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  addReview: async (request, reply) => {
    try {
      const user = request.user;
      const { productId } = request.params;
      const { rating, comment } = request.body;

      if (!rating || rating < 1 || rating > 5) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Rating must be between 1 and 5", 400)
          );
      }

      const product = await productService.addReview(
        productId,
        { rating, comment },
        user
      );

      logger.info(`Review added to product ${productId} by user ${user.email}`);
      return reply.status(200).send(formatResponse(product, false, null, 200));
    } catch (error) {
      logger.error(`Error adding review: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { productController };
