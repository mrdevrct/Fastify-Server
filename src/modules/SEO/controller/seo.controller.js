const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { seoService } = require("../service/seo.service");

const seoController = {
  createSeo: async (request, reply) => {
    try {
      const user = request.user;
      if (user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              null,
              true,
              "Only superadmins can create SEO attributes",
              403
            )
          );
      }

      const { entityId, entityType, ...seoData } = request.body;
      const seo = await seoService.createSeo(entityId, entityType, seoData);

      logger.info(
        `SEO created for ${entityType} with ID: ${entityId} by ${user.email}`
      );
      return reply.status(201).send(formatResponse(seo, false, null, 201));
    } catch (error) {
      logger.error(`Error creating SEO: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse(null, true, error.message, 400));
    }
  },

  getSeo: async (request, reply) => {
    try {
      const { entityId, entityType } = request.params;
      const seo = await seoService.getSeo(entityId, entityType);
      return reply.status(200).send(formatResponse(seo, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching SEO: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse(null, true, error.message, 400));
    }
  },

  updateSeo: async (request, reply) => {
    try {
      const user = request.user;
      if (user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              null,
              true,
              "Only superadmins can update SEO attributes",
              403
            )
          );
      }

      const { entityId, entityType } = request.params;
      const seoData = request.body;
      const seo = await seoService.updateSeo(entityId, entityType, seoData);

      logger.info(
        `SEO updated for ${entityType} with ID: ${entityId} by ${user.email}`
      );
      return reply.status(200).send(formatResponse(seo, false, null, 200));
    } catch (error) {
      logger.error(`Error updating SEO: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse(null, true, error.message, 400));
    }
  },

  deleteSeo: async (request, reply) => {
    try {
      const user = request.user;
      if (user.adminStatus !== "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse(
              null,
              true,
              "Only superadmins can delete SEO attributes",
              403
            )
          );
      }

      const { entityId, entityType } = request.params;
      await seoService.deleteSeo(entityId, entityType);

      logger.info(
        `SEO deleted for ${entityType} with ID: ${entityId} by ${user.email}`
      );
      return reply.status(200).send(formatResponse(null, false, null, 200));
    } catch (error) {
      logger.error(`Error deleting SEO: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse(null, true, error.message, 400));
    }
  },
};

module.exports = { seoController };
