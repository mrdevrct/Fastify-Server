const Festival = require("../model/festival.model");
const { logger } = require("../../../utils/logger/logger");

const festivalService = {
  createFestival: async (festivalData, user) => {
    try {
      const newFestival = new Festival({
        title: festivalData.title,
        slug: festivalData.slug,
        description: festivalData.description,
        bannerImage: {
          ...festivalData.bannerImage,
          uploadedBy: user.id,
        },
        discountPercentage: festivalData.discountPercentage,
        startDate: festivalData.startDate,
        endDate: festivalData.endDate,
        products: festivalData.products || [],
        category: festivalData.category || "ALL",
        metaTitle: festivalData.metaTitle,
        metaDescription: festivalData.metaDescription,
        status: festivalData.status || "INACTIVE",
      });

      await newFestival.save();
      return newFestival;
    } catch (error) {
      logger.error(`Error creating festival: ${error.message}`);
      throw error;
    }
  },

  getAllFestivals: async () => {
    try {
      const festivals = await Festival.find({}).sort({ startDate: -1 });
      return festivals;
    } catch (error) {
      logger.error(`Error fetching festivals: ${error.message}`);
      throw error;
    }
  },

  getFestival: async (identifier) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { slug: identifier };

      const festival = await Festival.findOne(query);
      if (!festival) {
        throw new Error("Festival not found");
      }
      return festival;
    } catch (error) {
      logger.error(`Error fetching festival: ${error.message}`);
      throw error;
    }
  },

  updateFestival: async (festivalId, updateData, user) => {
    try {
      const festival = await Festival.findById(festivalId);
      if (!festival) throw new Error("Festival not found");

      if (updateData.title) festival.title = updateData.title;
      if (updateData.slug) festival.slug = updateData.slug;
      if (updateData.description) festival.description = updateData.description;
      if (updateData.bannerImage)
        festival.bannerImage = {
          ...updateData.bannerImage,
          uploadedBy: user.id,
        };
      if (updateData.discountPercentage)
        festival.discountPercentage = updateData.discountPercentage;
      if (updateData.startDate) festival.startDate = updateData.startDate;
      if (updateData.endDate) festival.endDate = updateData.endDate;
      if (updateData.products) festival.products = updateData.products;
      if (updateData.category) festival.category = updateData.category;
      if (updateData.metaTitle) festival.metaTitle = updateData.metaTitle;
      if (updateData.metaDescription)
        festival.metaDescription = updateData.metaDescription;
      if (updateData.status) festival.status = updateData.status;

      festival.updatedAt = new Date();
      await festival.save();

      return festival;
    } catch (error) {
      logger.error(`Error updating festival: ${error.message}`);
      throw error;
    }
  },

  deleteFestival: async (festivalId, user) => {
    try {
      const festival = await Festival.findById(festivalId);
      if (!festival) throw new Error("Festival not found");

      await festival.remove();
      return true;
    } catch (error) {
      logger.error(`Error deleting festival: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { festivalService };
