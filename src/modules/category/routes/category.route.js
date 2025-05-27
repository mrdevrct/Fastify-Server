const { categoryController } = require("../controller/category.controller");

const categoryRoutes = async (fastify, options) => {
  fastify.post("/", { preValidation: [fastify.auth] }, categoryController.createCategory);
  fastify.get("/", categoryController.getCategories);
  fastify.get("/:identifier", categoryController.getCategory);
  fastify.put("/:categoryId", { preValidation: [fastify.auth] }, categoryController.updateCategory);
  fastify.delete("/:categoryId", { preValidation: [fastify.auth] }, categoryController.deleteCategory);
};

module.exports = categoryRoutes;