const Report = require("../model/report.model");
const User = require("../../user/model/user.model");
const { logger } = require("../../../utils/logger/logger");

const reportService = {
  // ثبت ریپورت
  createReport: async (reporterId, { reportedUserId, reason }) => {
    try {
      // بررسی وجود کاربر گزارش‌شده
      const reportedUser = await User.findById(reportedUserId);
      if (!reportedUser) {
        throw new Error("Reported user not found");
      }
      if (reportedUser.isBanned) {
        throw new Error("Reported user is already banned");
      }

      // ثبت ریپورت
      const report = new Report({
        reporter: reporterId,
        reportedUser: reportedUserId,
        reason,
      });
      await report.save();

      // افزایش تعداد ریپورت‌ها
      reportedUser.reportCount = (reportedUser.reportCount || 0) + 1;

      // بن خودکار پس از 3 ریپورت
      if (reportedUser.reportCount >= 3) {
        reportedUser.isBanned = true;
        logger.info(
          `User ${reportedUser.email} banned automatically due to 3 reports`
        );
      }

      await reportedUser.save();
      logger.info(`Report created by ${reporterId} against ${reportedUserId}`);
      return report;
    } catch (error) {
      if (error.code === 11000) {
        // خطای ایندکس یکتا
        throw new Error("You have already reported this user");
      }
      throw error;
    }
  },

  // بن کردن دستی توسط سوپر ادمین
  banUser: async (userId, superAdminId) => {
    const superAdmin = await User.findById(superAdminId);
    if (!superAdmin || superAdmin.adminStatus !== "SUPER_ADMIN") {
      throw new Error("Only super admin can ban users");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (user.isBanned) {
      throw new Error("User is already banned");
    }

    user.isBanned = true;
    await user.save();
    logger.info(`User ${user.email} banned by super admin ${superAdmin.email}`);
    return user;
  },

  // آن بن کردن دستی توسط سوپر ادمین
  unbanUser: async (userId, superAdminId) => {
    const superAdmin = await User.findById(superAdminId);
    if (!superAdmin || superAdmin.adminStatus !== "SUPER_ADMIN") {
      throw new Error("Only super admin can unban users");
    }

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    if (!user.isBanned) {
      throw new Error("User is not banned");
    }

    user.isBanned = false;
    user.reportCount = 0; // بازنشانی تعداد ریپورت‌ها
    await user.save();
    logger.info(
      `User ${user.email} unbanned by super admin ${superAdmin.email}`
    );
    return user;
  },

  // گرفتن لیست کاربران ریپورت شده
  getReportedUsers: async (page = 1, perPage = 20) => {
    try {
      const skip = (page - 1) * perPage;

      const [users, total] = await Promise.all([
        User.find({ reportCount: { $gt: 0 } })
          .select("-password")
          .sort({ reportCount: -1 })
          .skip(skip)
          .limit(perPage)
          .lean()
          .exec(),
        User.countDocuments({ reportCount: { $gt: 0 } }),
      ]);

      const formattedUsers = users.map((user) => ({
        id: user._id,
        email: user.email,
        username: user.username,
        reportCount: user.reportCount,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return { users: formattedUsers, total };
    } catch (error) {
      logger.error(`Error fetching reported users: ${error.message}`);
      throw error;
    }
  },

  // گرفتن لیست کاربران بن شده
  getBannedUsers: async (page = 1, perPage = 20) => {
    try {
      const skip = (page - 1) * perPage;

      const [users, total] = await Promise.all([
        User.find({ isBanned: true })
          .select("-password")
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean()
          .exec(),
        User.countDocuments({ isBanned: true }),
      ]);

      const formattedUsers = users.map((user) => ({
        id: user._id,
        email: user.email,
        username: user.username,
        reportCount: user.reportCount,
        isBanned: user.isBanned,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      }));

      return { users: formattedUsers, total };
    } catch (error) {
      logger.error(`Error fetching banned users: ${error.message}`);
      throw error;
    }
  },

  clearReportsOfUser: async (userId) => {
    // حذف همه ریپورت‌هایی که علیه این کاربر ثبت شده
    await Report.deleteMany({ reportedUser: userId });

    // مقدار reportCount کاربر را صفر کن
    const user = await User.findById(userId);
    if (user) {
      user.reportCount = 0;
      await user.save();
    }
    return user;
  },

  // حذف همه ریپورت‌ها (تمام جدول Report)
  clearAllReports: async () => {
    await Report.deleteMany({});
    // مقدار reportCount همه کاربران را صفر کن
    await User.updateMany(
      { reportCount: { $gt: 0 } },
      { $set: { reportCount: 0 } }
    );
    return true;
  },

  // حذف یک ریپورت خاص با آیدی ریپورت
  deleteSingleReport: async (reportId) => {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // کاهش reportCount کاربر مربوطه
    const reportedUser = await User.findById(report.reportedUser);
    if (reportedUser && reportedUser.reportCount > 0) {
      reportedUser.reportCount -= 1;
      await reportedUser.save();
    }

    await report.deleteOne();
    return true;
  },

  // دریافت ریپورت با آیدی
  getReportById: async (reportId) => {
    const report = await Report.findById(reportId);
    if (!report) {
      throw new Error("Report not found");
    }
    return report;
  },
};

module.exports = { reportService };
