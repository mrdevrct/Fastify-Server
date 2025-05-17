const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { festivalService } = require("../service/festival.service");

const festivalController = {
  createFestival: async (request, reply) => {
    try {
      const user = request.user;
      const festivalData = {};
      let bannerImageData = null;

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "bannerImage") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid banner image size", 400));
          }
          bannerImageData = { ...part, size: fileSize, fileBuffer };
        } else if (part.type === "field") {
          if (part.fieldname.endsWith("[]")) {
            const fieldName = part.fieldname.slice(0, -2);
            festivalData[fieldName] = festivalData[fieldName] || [];
            festivalData[fieldName].push(part.value);
          } else {
            festivalData[part.fieldname] = part.value;
          }
        }
      }

      if (
        !festivalData.title ||
        !festivalData.description ||
        !festivalData.discountPercentage ||
        !festivalData.startDate ||
        !festivalData.endDate
      ) {
        return reply
          .status(400)
          .send(
            formatResponse(
              {},
              true,
              "Title, description, discountPercentage, startDate, and endDate are required",
              400
            )
          );
      }

      if (!bannerImageData && !festivalData.bannerImage) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Banner image is required", 400));
      }

      if (!festivalData.slug) {
        festivalData.slug = festivalData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      const bannerImage = bannerImageData
        ? await fileUploader.uploadFestivalBannerImage(bannerImageData, user)
        : festivalData.bannerImage;

      const newFestival = await festivalService.createFestival(
        { ...festivalData, bannerImage },
        user
      );

      logger.info(`Festival created by user: ${user.email}`);
      return reply
        .status(201)
        .send(formatResponse(newFestival, false, null, 201));
    } catch (error) {
      logger.error(`Error creating festival: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getAllFestivals: async (request, reply) => {
    try {
      const festivals = await festivalService.getAllFestivals();
      logger.info(`All festivals retrieved`);
      return reply
        .status(200)
        .send(formatResponse(festivals, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving festivals: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getFestival: async (request, reply) => {
    try {
      const { identifier } = request.params;
      const festival = await festivalService.getFestival(identifier);
      logger.info(`Festival ${identifier} retrieved`);
      return reply.status(200).send(formatResponse(festival, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching festival: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updateFestival: async (request, reply) => {
    try {
      const user = request.user;
      const { festivalId } = request.params;
      const updateData = {};
      let bannerImageData = null;

      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "bannerImage") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid banner image size", 400));
          }
          bannerImageData = { ...part, size: fileSize, fileBuffer };
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

      if (updateData.title && !updateData.slug) {
        updateData.slug = updateData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      let bannerImage = updateData.bannerImage;
      if (bannerImageData) {
        bannerImage = await fileUploader.uploadFestivalBannerImage(
          bannerImageData,
          user
        );
      }

      const festival = await festivalService.updateFestival(
        festivalId,
        { ...updateData, bannerImage },
        user
      );

      logger.info(`Festival ${festivalId} updated by user ${user.email}`);
      return reply.status(200).send(formatResponse(festival, false, null, 200));
    } catch (error) {
      logger.error(`Error updating festival: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  deleteFestival: async (request, reply) => {
    try {
      const user = request.user;
      const { festivalId } = request.params;
      await festivalService.deleteFestival(festivalId, user);
      logger.info(`Festival ${festivalId} deleted by user ${user.email}`);
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error deleting festival: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { festivalController };
