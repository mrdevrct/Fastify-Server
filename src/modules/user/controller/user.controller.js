const { logger } = require("../../../utils/logger/logger");
const { paginate } = require("../../../utils/pagination/paginate");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { generateToken } = require("../../../utils/user/userGenerators");
const { userService } = require("../service/user.service");
const {
  notificationService,
} = require("../../notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const userController = {
  auth: async (request, reply) => {
    try {
      const user = await userService.auth(request.body);
      logger.info(`Auth processed for: ${user.email}`);
      return formatResponse(
        { message: "Verification code sent to your email" },
        false,
        null,
        201
      );
    } catch (error) {
      logger.error(`Error in auth: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  verifyCode: async (request, reply) => {
    try {
      const { user, refreshToken, refreshTokenExpires } =
        await userService.verifyCode(request.body);
      const token = generateToken(user);

      // ارسال نوتیفیکیشن برای فعال‌سازی حساب
      await notificationService.createAndSendNotification(
        request.server,
        user._id.toString(),
        NOTIFICATION_TYPES.ACTIVATE_USER,
        `Your account has been activated: ${user.email}`,
        {
          userId: user._id.toString(),
          username: user.username,
          email: user.email,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`User verified: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        adminStatus: user.adminStatus,
        featureAccess: user.featureAccess,
        token,
        refreshToken,
        refreshTokenExpires,
      });
    } catch (error) {
      logger.error(`Error verifying code: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  loginWithPassword: async (request, reply) => {
    try {
      const { user, refreshToken, refreshTokenExpires } =
        await userService.loginWithPassword(request.body);
      const token = generateToken(user);
      logger.info(`User logged in: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        adminStatus: user.adminStatus,
        featureAccess: user.featureAccess,
        token,
        refreshToken,
        refreshTokenExpires,
      });
    } catch (error) {
      logger.error(`Error logging in: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  forgotPassword: async (request, reply) => {
    try {
      await userService.forgotPassword(request.body);
      logger.info(`Password reset code sent for: ${request.body.email}`);
      return formatResponse(
        { message: "Password reset code sent to your email" },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error in forgot password: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  resetPassword: async (request, reply) => {
    try {
      const user = await userService.resetPassword(request.body);
      logger.info(`Password reset successfully for: ${user.email}`);
      return formatResponse(
        { message: "Password reset successfully" },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error resetting password: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  updateProfile: async (request, reply) => {
    try {
      const user = await userService.updateProfile(
        request.user.id,
        request.body
      );
      if (!user) {
        return formatResponse({}, true, "User not found", 404);
      }

      // نوتیفیکیشن برای به‌روزرسانی پروفایل
      await notificationService.createAndSendNotification(
        request.server,
        user._id.toString(),
        NOTIFICATION_TYPES.UPDATE_USER_PROFILE,
        `User profile updated: ${user.email}`,
        {
          userId: user._id.toString(),
          username: user.username,
          email: user.email,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`User profile updated: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        userType: user.userType,
        adminStatus: user.adminStatus,
        profilePath: user.profilePath,
        reportCount: user.reportCount,
        isBanned: user.isBanned,
        featureAccess: user.featureAccess,
      });
    } catch (error) {
      logger.error(`Error updating profile: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  uploadProfileImage: async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return formatResponse({}, true, "No file uploaded", 400);
      }

      const user = await userService.findById(request.user.id);
      if (!user) {
        return formatResponse({}, true, "User not found", 404);
      }

      const profilePath = await fileUploader.uploadProfileImage(
        data,
        user,
        "user"
      );
      const updatedUser = await userService.updateProfile(request.user.id, {
        profilePath,
      });

      // نوتیفیکیشن برای به‌روزرسانی تصویر پروفایل
      await notificationService.createAndSendNotification(
        request.server,
        updatedUser._id.toString(),
        NOTIFICATION_TYPES.UPDATE_USER_PROFILE,
        `Profile image updated for: ${updatedUser.email}`,
        {
          userId: updatedUser._id.toString(),
          username: updatedUser.username,
          email: updatedUser.email,
          profilePath: updatedUser.profilePath,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Profile image updated for user: ${user.email}`);
      return formatResponse({
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        profilePath: updatedUser.profilePath,
      });
    } catch (error) {
      logger.error(`Error uploading profile image: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  getProfile: async (request, reply) => {
    try {
      const user = await userService.getProfile(request.user.id);
      logger.info(`Profile retrieved: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        userType: user.userType,
        adminStatus: user.adminStatus,
        profilePath: user.profilePath,
        reportCount: user.reportCount,
        isBanned: user.isBanned,
        featureAccess: user.featureAccess,
      });
    } catch (error) {
      logger.error(`Error retrieving profile: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  updateFeatureAccess: async (request, reply) => {
    try {
      const user = await userService.updateFeatureAccess(
        request.user.id,
        request.body
      );

      // نوتیفیکیشن برای به‌روزرسانی دسترسی‌ها
      await notificationService.createAndSendNotification(
        request.server,
        user._id.toString(),
        NOTIFICATION_TYPES.UPDATE_USER_PROFILE,
        `Feature access updated for: ${user.email}`,
        {
          userId: user._id.toString(),
          username: user.username,
          email: user.email,
          featureAccess: user.featureAccess,
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`Feature access updated for user: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        featureAccess: user.featureAccess,
      });
    } catch (error) {
      logger.error(`Error updating feature access: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  getCurrentUser: async (request, reply) => {
    try {
      const user = await userService.getCurrentUser(request.user.id);
      logger.info(`Current user retrieved: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        lastName: user.lastName,
        firstName: user.firstName,
        userType: user.userType,
        adminStatus: user.adminStatus,
        profilePath: user.profilePath,
        reportCount: user.reportCount,
        isBanned: user.isBanned,
        featureAccess: user.featureAccess,
      });
    } catch (error) {
      logger.error(`Error retrieving current user: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  getUsers: async (request, reply) => {
    try {
      const page = Math.max(parseInt(request.query.page) || 1, 1);
      const perPage = parseInt(process.env.USERS_PER_PAGE) || 20;

      const { users, total } = await userService.getUsers(
        request.user.id,
        page,
        perPage
      );

      const pagination = paginate({ total, page, perPage });

      logger.info(`User list retrieved by user: ${request.user.id}`);
      return formatResponse(users, false, null, 200, pagination);
    } catch (error) {
      logger.error(`Error retrieving users: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  refreshToken: async (request, reply) => {
    try {
      const { user, accessToken, refreshToken, refreshTokenExpires } =
        await userService.refreshToken(request.body);
      logger.info(`Token refreshed for user: ${user.email}`);
      return formatResponse({
        id: user._id,
        username: user.username,
        email: user.email,
        userType: user.userType,
        adminStatus: user.adminStatus,
        featureAccess: user.featureAccess,
        token: accessToken,
        refreshToken,
        refreshTokenExpires,
      });
    } catch (error) {
      logger.error(`Error refreshing token: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },

  banUser: async (request, reply) => {
    try {
      const admin = request.user;
      const { userId, reason } = request.body;

      const user = await userService.findById(userId);
      if (!user) {
        return formatResponse({}, true, "User not found", 404);
      }

      // بن کردن کاربر
      const bannedUser = await userService.banUser(userId, reason);

      // ابطال توکن‌ها
      await userService.invalidateTokens(userId);

      // نوتیفیکیشن برای بن شدن
      await notificationService.createAndSendNotification(
        request.server,
        userId,
        NOTIFICATION_TYPES.SUSPEND_USER,
        `Your account has been suspended: ${reason || "No reason provided"}`,
        {
          userId: userId,
          username: bannedUser.username,
          email: bannedUser.email,
          reason: reason || "No reason provided",
          timestamp: new Date().toISOString(),
        }
      );

      logger.info(`User ${userId} banned by admin ${admin.email}`);
      return formatResponse(
        { message: `User ${bannedUser.email} banned successfully` },
        false,
        null,
        200
      );
    } catch (error) {
      logger.error(`Error banning user: ${error.message}`);
      return formatResponse({}, true, error.message, 400);
    }
  },
};

module.exports = { userController };
