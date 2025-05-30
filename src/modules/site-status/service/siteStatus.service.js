const mongoose = require("mongoose");
const SiteStatus = require("../model/siteStatus.model");
const { logger } = require("../../../utils/logger/logger");

const siteStatusService = {
  createOrUpdateStatus: async (statusData, user) => {
    try {
      const existingStatus = await SiteStatus.findOne().sort({ createdAt: -1 });

      if (existingStatus && existingStatus.status === statusData.status && existingStatus.message === statusData.message) {
        return existingStatus;
      }

      const newStatus = new SiteStatus({
        status: statusData.status,
        message: statusData.message || "",
        expectedResolutionTime: statusData.expectedResolutionTime || null,
        updatedBy: user.id,
      });

      await newStatus.save();
      return newStatus;
    } catch (error) {
      logger.error(`Error creating/updating site status: ${error.message}`);
      throw error;
    }
  },

  getCurrentValidStatus: async () => {
    try {
      const now = new Date();
      const status = await SiteStatus.findOne({
        $or: [
          { expectedResolutionTime: { $gte: now } },
          { expectedResolutionTime: null },
        ],
      }).sort({ createdAt: -1 });

      if (!status) {
        const defaultStatus = new SiteStatus({
          status: "OPERATIONAL",
          message: "Site is operational",
          updatedBy: mongoose.Types.ObjectId("60c7e8b9c9e7b1234567889"), // ID پیش‌فرض برای سیستم
        });
        await defaultStatus.save();
        return defaultStatus;
      }

      return status;
    } catch (error) {
      logger.error(`Error fetching current valid site status: ${error.message}`);
      throw error;
    }
  },

  getStatusHistory: async (filters = {}, options = {}) => {
    try {
      const query = {};
      if (filters.status) query.status = filters.status;
      if (filters.fromDate) query.createdAt = { $gte: new Date(filters.fromDate) };
      if (filters.toDate) query.createdAt = { ...query.createdAt, $lte: new Date(filters.toDate) };

      const statuses = await SiteStatus.find(query)
        .sort({ createdAt: -1 })
        .limit(options.limit || 50);

      return statuses;
    } catch (error) {
      logger.error(`Error fetching status history: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { siteStatusService };