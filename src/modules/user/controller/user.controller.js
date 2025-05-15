const { logger } = require("../../../utils/logger/logger");
const { paginate } = require("../../../utils/pagination/paginate");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/uploader");
const { generateToken } = require("../../../utils/user/userGenerators");
const { userService } = require("../service/user.service");
const jwt = require("jsonwebtoken");

const userController = {
  // Sign up or login with email
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

  // Verify code
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

  // Login with password
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

  // Forgot password
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

  // Reset password
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

  // Update profile
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

  // Upload profile image
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

      const profilePath = await fileUploader.uploadProfileImage(data, user, "user");
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

  // Get profile
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

  // Update feature access
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

  // Get currently logged-in user
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

  // Get list of users
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

  // Refresh token
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
