const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { productController } = require("../controller/product.controller");
const { createProductDto, updateProductDto } = require("../dto/product.dto");

const productRoutes = async (fastify, options) => {
  // Create product
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    productController.createProduct
  );

  // Get my products
  fastify.get(
    "/my-products",
    {
      preValidation: [fastify.auth],
    },
    productController.getMyProducts
  );

  // Get all products
  fastify.get(
    "/all-products",
    {
      preValidation: [fastify.auth],
    },
    productController.getAllProducts
  );

  // Get product by ID or slug
  fastify.get(
    "/:identifier",
    {
      preValidation: [fastify.auth],
    },
    productController.getProduct
  );

  // Update product
  fastify.put(
    "/:productId",
    {
      preValidation: [fastify.auth],
    },
    productController.updateProduct
  );

  // Delete product
  fastify.delete(
    "/:productId",
    {
      preValidation: [fastify.auth],
    },
    productController.deleteProduct
  );

  // Add review
  fastify.post(
    "/:productId/review",
    {
      preValidation: [fastify.auth],
    },
    productController.addReview
  );
};

module.exports = productRoutes;
