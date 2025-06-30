const mongoose = require("mongoose");
const Seo = require("../model/seo.model");
const { logger } = require("../../../utils/logger/logger");
const { buildSeoAttributes } = require("../../../utils/seo/seoHelper");

const seoService = {
  createSeo: async (entityId, entityType, seoData) => {
    try {
      const seoAttributes = buildSeoAttributes(seoData, entityType, false);

      const seo = new Seo({
        entityId,
        entityType,
        ...seoAttributes,
      });

      await seo.save();
      logger.info(`SEO created for ${entityType} with ID: ${entityId}`);
      return seo;
    } catch (error) {
      logger.error(`Error creating SEO: ${error.message}`);
      throw error;
    }
  },

  getSeo: async (entityId, entityType) => {
    try {
      const seo = await Seo.findOne({ entityId, entityType });
      if (!seo) {
        logger.info(`No SEO found for ${entityType} with ID: ${entityId}`);
        return null;
      }
      return seo;
    } catch (error) {
      logger.error(`Error fetching SEO: ${error.message}`);
      throw error;
    }
  },

  updateSeo: async (entityId, entityType, seoData) => {
    try {
      const seoAttributes = buildSeoAttributes(seoData, entityType, false);

      const seo = await Seo.findOneAndUpdate(
        { entityId, entityType },
        { ...seoAttributes, updatedAt: new Date() },
        { new: true, upsert: true }
      );

      logger.info(`SEO updated for ${entityType} with ID: ${entityId}`);
      return seo;
    } catch (error) {
      logger.error(`Error updating SEO: ${error.message}`);
      throw error;
    }
  },

  deleteSeo: async (entityId, entityType) => {
    try {
      await Seo.deleteOne({ entityId, entityType });
      logger.info(`SEO deleted for ${entityType} with ID: ${entityId}`);
      return true;
    } catch (error) {
      logger.error(`Error deleting SEO: ${error.message}`);
      throw error;
    }
  },

  getListSeo: async (entityType) => {
    try {
      const seoAttributes = buildSeoAttributes(null, entityType, true);
      return seoAttributes;
    } catch (error) {
      logger.error(
        `Error fetching list SEO for ${entityType}: ${error.message}`
      );
      throw error;
    }
  },
};

module.exports = { seoService };
