const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const { bannerService } = require("../service/banner.service");

const bannerController = {
  // ایجاد بنر
  create: async (request, reply) => {
    try {
      const bannerData = {
        ...request.body,
        expirationDate: new Date(request.body.expirationDate),
      };
      const banner = await bannerService.create(bannerData);
      logger.info(`Banner created: ${banner.title}`);
      return formatResponse({
        id: banner._id,
        imageSrc: banner.imageSrc,
        imageAlt: banner.imageAlt,
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link,
        isDiscount: banner.isDiscount,
        expirationDate: banner.expirationDate,
      });
    } catch (error) {
      logger.error(`Error creating banner: ${error.message}`);
      return formatResponse({}, true, error.message, 500);
    }
  },

  // دریافت همه بنرها
  findAll: async (request, reply) => {
    try {
      const banners = await bannerService.findAll();
      const formattedBanners = banners.map((banner) => ({
        id: banner._id,
        imageSrc: banner.imageSrc,
        imageAlt: banner.imageAlt,
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link,
        isDiscount: banner.isDiscount,
        expirationDate: banner.expirationDate,
      }));
      return formatResponse(formattedBanners);
    } catch (error) {
      logger.error(`Error fetching banners: ${error.message}`);
      return formatResponse({}, true, error.message, 500);
    }
  },

  // دریافت بنر با شناسه
  findById: async (request, reply) => {
    try {
      const banner = await bannerService.findById(request.params.id);
      if (!banner) {
        return formatResponse({}, true, "Banner not found", 404);
      }
      return formatResponse({
        id: banner._id,
        imageSrc: banner.imageSrc,
        imageAlt: banner.imageAlt,
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link,
        isDiscount: banner.isDiscount,
        expirationDate: banner.expirationDate,
      });
    } catch (error) {
      logger.error(`Error fetching banner: ${error.message}`);
      return formatResponse({}, true, error.message, 500);
    }
  },

  // به‌روزرسانی بنر
  update: async (request, reply) => {
    try {
      const bannerData = {
        ...request.body,
        expirationDate: request.body.expirationDate
          ? new Date(request.body.expirationDate)
          : undefined,
      };
      const banner = await bannerService.update(request.params.id, bannerData);
      if (!banner) {
        return formatResponse({}, true, "Banner not found", 404);
      }
      logger.info(`Banner updated: ${banner.title}`);
      return formatResponse({
        id: banner._id,
        imageSrc: banner.imageSrc,
        imageAlt: banner.imageAlt,
        title: banner.title,
        subtitle: banner.subtitle,
        link: banner.link,
        isDiscount: banner.isDiscount,
        expirationDate: banner.expirationDate,
      });
    } catch (error) {
      logger.error(`Error updating banner: ${error.message}`);
      return formatResponse({}, true, error.message, 500);
    }
  },

  // حذف بنر
  delete: async (request, reply) => {
    try {
      const banner = await bannerService.delete(request.params.id);
      if (!banner) {
        return formatResponse({}, true, "Banner not found", 404);
      }
      logger.info(`Banner deleted: ${banner.title}`);
      return formatResponse(null, false, "Banner deleted successfully");
    } catch (error) {
      logger.error(`Error deleting banner: ${error.message}`);
      return formatResponse({}, true, error.message, 500);
    }
  },
};

module.exports = { bannerController };
