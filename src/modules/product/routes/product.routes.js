const { productController } = require("../controller/product.controller");

const productRoutes = async (fastify, options) => {
  fastify.post(
    "/",
    { preValidation: [fastify.auth] },
    productController.createProduct
  );
  fastify.get(
    "/my-products",
    { preValidation: [fastify.auth] },
    productController.getProducts
  );
  fastify.get(
    "/all-products",
    { preValidation: [fastify.auth] },
    productController.getProducts
  );
  fastify.get("/new", productController.getNewProducts);
  fastify.get("/popular", productController.getPopularProducts);
  fastify.get("/top-selling", productController.getTopSellingProducts);
  fastify.get("/most-discounted", productController.getMostDiscountedProducts);
  fastify.get(
    "/:identifier",
    { preValidation: [fastify.auth] },
    productController.getProduct
  );
  fastify.put(
    "/:productId",
    { preValidation: [fastify.auth] },
    productController.updateProduct
  );
  fastify.delete(
    "/:productId",
    { preValidation: [fastify.auth] },
    productController.deleteProduct
  );
  fastify.post(
    "/:productId/review",
    { preValidation: [fastify.auth] },
    productController.addReview
  );
};

module.exports = productRoutes;
