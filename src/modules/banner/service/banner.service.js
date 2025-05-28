const Banner = require("../model/banner.model");

const bannerService = {
  // ایجاد بنر
  create: async (bannerData) => {
    const banner = new Banner(bannerData);
    return await banner.save();
  },

  // دریافت همه بنرهای غیرمنقضی‌شده
  findAll: async () => {
    return await Banner.find({ expirationDate: { $gte: new Date() } });
  },

  // دریافت بنر با شناسه
  findById: async (id) => {
    return await Banner.findById(id);
  },

  // به‌روزرسانی بنر
  update: async (id, bannerData) => {
    return await Banner.findByIdAndUpdate(id, bannerData, { new: true });
  },

  // حذف بنر
  delete: async (id) => {
    return await Banner.findByIdAndDelete(id);
  },
};

module.exports = { bannerService };
