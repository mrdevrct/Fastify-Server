const { logger } = require("../../../utils/logger/logger");
const { paginate } = require("../../../utils/pagination/paginate");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/uploader");
const { userService } = require("../service/user.service");
const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

const userController = {
  // ثبت‌نام یا ورود با ایمیل
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

  // تأیید کد
  verifyCode: async (request, reply) => {
    try {
      const { user, refreshToken, refreshTokenExpires } =
        await userService.verifyCode(request.body);
      const token = generateToken(user);
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

  // ورود با رمز عبور
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

  // به‌روزرسانی پروفایل
  updateProfile: async (request, reply) => {
    try {
      const user = await userService.updateProfile(
        request.user.id,
        request.body
      );
      if (!user) {
        return formatResponse({}, true, "User not found", 404);
      }
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

  // آپلود تصویر پروفایل
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

      const profilePath = await fileUploader.uploadProfileImage(data, user);
      const updatedUser = await userService.updateProfile(request.user.id, {
        profilePath,
      });

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

  // دریافت پروفایل
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

  // به‌روزرسانی دسترسی‌های فیچر
  updateFeatureAccess: async (request, reply) => {
    try {
      const user = await userService.updateFeatureAccess(
        request.user.id,
        request.body
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

  // دریافت اطلاعات کاربر لاگین‌شده
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

  // دریافت لیست کاربران
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

  // رفرش توکن
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
};

module.exports = { userController };
