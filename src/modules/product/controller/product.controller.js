const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { productService } = require("../service/product.service");
const { paginate } = require("../../../utils/pagination/paginate");
const {
  notificationService,
} = require("../../notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const productController = {
  createProduct: async (request, reply) => {
    try {
      const user = request.user;
      const productData = {};
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
            productData[fieldName] = productData[fieldName] || [];
            productData[fieldName].push(part.value);
          } else if (part.fieldname === "attributes") {
            productData.attributes = JSON.parse(part.value);
          } else {
            productData[part.fieldname] = part.value;
          }
        }
      }

      if (
        !productData.name ||
        !productData.description ||
        !productData.price ||
        productData.stock == null ||
        !productData.categoryId
      ) {
        return reply
          .status(400)
          .send(
            formatResponse(
              {},
              true,
              "Name, description, price, stock, and categoryId are required",
              400
            )
          );
      }

      if (!mainImageData && !productData.mainImage) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Main image is required", 400));
      }

      if (mediaData.length > 10) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Maximum 10 media files allowed", 400)
          );
      }

      const mainImage = mainImageData
        ? await fileUploader.uploadProductMainImage(mainImageData, user)
        : productData.mainImage;

      const media =
        mediaData.length > 0
          ? await fileUploader.uploadProductMedia(
              mediaData,
              user,
              productData._id
            )
          : productData.media || [];

      const newProduct = await productService.createProduct(
        { ...productData, mainImage, media },
        user
      );

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.ADD_PRODUCT,
        `New product added: ${newProduct.name}`,
        {
          productId: newProduct._id.toString(),
          name: newProduct.name,
          description: newProduct.description,
          price: newProduct.price,
          categoryId: newProduct.categoryId.toString(),
          timestamp: new Date().toISOString(),
        }
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

  getProducts: async (request, reply) => {
    try {
      const {
        categorySlug,
        brand,
        minPrice,
        maxPrice,
        inStock,
        tags,
        search,
        sortBy,
        page,
        perPage,
      } = request.query;

      const pageNum = Math.max(parseInt(page) || 1, 1);
      const perPageNum =
        parseInt(perPage) || parseInt(process.env.PRODUCTS_PER_PAGE) || 20;

      const filters = {
        categorySlug,
        brand,
        minPrice,
        maxPrice,
        inStock,
        tags,
        search,
      };
      const sort = { sortBy };

      const { products, total } = await productService.getProducts(
        filters,
        sort,
        pageNum,
        perPageNum
      );

      const pagination = paginate({
        total,
        page: pageNum,
        perPage: perPageNum,
      });

      // Log user ID only if user is authenticated
      if (request.user) {
        logger.info(`Product list retrieved by user: ${request.user.id}`);
      } else {
        logger.info(`Product list retrieved by unauthenticated user`);
      }

      return reply
        .status(200)
        .send(formatResponse(products, false, null, 200, pagination));
    } catch (error) {
      logger.error(`Error fetching products: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getNewProducts: async (request, reply) => {
    try {
      const products = await productService.getNewProducts();
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching new products: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getPopularProducts: async (request, reply) => {
    try {
      const { categorySlug } = request.query;
      const products = await productService.getPopularProducts(
        10,
        categorySlug
      );
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching popular products: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getTopSellingProducts: async (request, reply) => {
    try {
      const { categorySlug } = request.query;
      const products = await productService.getTopSellingProducts(
        10,
        categorySlug
      );
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching top-selling products: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getMostDiscountedProducts: async (request, reply) => {
    try {
      const { categorySlug } = request.query;
      const products = await productService.getMostDiscountedProducts(
        10,
        categorySlug
      );
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching most discounted products: ${error.message}`);
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

  getSimilarProducts: async (request, reply) => {
    try {
      const { identifier } = request.params;
      const products = await productService.getSimilarProducts(identifier);
      return reply.status(200).send(formatResponse(products, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching similar products: ${error.message}`);
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
          } else if (part.fieldname === "attributes") {
            updateData.attributes = JSON.parse(part.value);
          } else {
            updateData[part.fieldname] = part.value;
          }
        }
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

      // نوتیفیکیشن برای به‌روزرسانی محصول
      const notificationType = updateData.price
        ? NOTIFICATION_TYPES.UPDATE_PRICE
        : NOTIFICATION_TYPES.UPDATE_PRODUCT_SPEC;
      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        notificationType,
        updateData.price
          ? `Price updated for product: ${product.name}`
          : `Product specifications updated: ${product.name}`,
        {
          productId: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId.toString(),
          timestamp: new Date().toISOString(),
        }
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
      const product = await productService.getProduct(productId, user);
      await productService.deleteProduct(productId, user);

      // نوتیفیکیشن برای حذف محصول
      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.REMOVE_PRODUCT,
        `Product removed: ${product.name}`,
        {
          productId: product._id.toString(),
          name: product.name,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId.toString(),
          timestamp: new Date().toISOString(),
        }
      );

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

      // نوتیفیکیشن برای افزودن نظر
      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.GENERAL_NOTIFICATION,
        `New review added for product: ${product.name}`,
        {
          productId: product._id.toString(),
          name: product.name,
          rating,
          comment,
          reviewer: user.email,
          timestamp: new Date().toISOString(),
        }
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
