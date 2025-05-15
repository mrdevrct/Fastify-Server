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
};

module.exports = { reportService };
