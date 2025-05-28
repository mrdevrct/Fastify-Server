const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { festivalController } = require("../controller/festival.controller");

const festivalRoutes = async (fastify, options) => {
  // ایجاد جشنواره
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    festivalController.createFestival
  );

  // دریافت تمام جشنواره‌ها
  fastify.get(
    "/",
    {
      preValidation: [fastify.auth],
    },
    festivalController.getAllFestivals
  );

  // دریافت جشنواره با شناسه یا slug
  fastify.get(
    "/:identifier",
    {
      preValidation: [fastify.auth],
    },
    festivalController.getFestival
  );

  // به‌روزرسانی جشنواره
  fastify.put(
    "/:festivalId",
    {
      preValidation: [fastify.auth],
    },
    festivalController.updateFestival
  );

  // حذف جشنواره
  fastify.delete(
    "/:festivalId",
    {
      preValidation: [fastify.auth],
    },
    festivalController.deleteFestival
  );
};

module.exports = festivalRoutes;
