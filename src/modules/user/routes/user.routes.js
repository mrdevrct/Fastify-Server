const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { userController } = require("../controller/user.controller");
const {
  authDto,
  verifyCodeDto,
  loginWithPasswordDto,
  updateProfileDto,
  updateFeatureAccessDto,
  refreshTokenDto,
  forgotPasswordDto,
  resetPasswordDto,
} = require("../dto/user.dto");
const adminOnlyMiddleware = require("../../../middlewares/auth/adminOnly.middleware");
const ipBlockMiddleware = require("../../../middlewares/security/ipBlock.middleware");

const userRoutes = async (fastify, options) => {
  // Sign up or log in with email
  fastify.post(
    "/auth",
    { preValidation: [validateMiddleware(authDto)] },
    ipBlockMiddleware(userController.auth)
  );

  // Verify code
  fastify.post(
    "/verify",
    { preValidation: [validateMiddleware(verifyCodeDto)] },
    ipBlockMiddleware(userController.verifyCode)
  );

  // Log in with password
  fastify.post(
    "/login",
    { preValidation: [validateMiddleware(loginWithPasswordDto)] },
    ipBlockMiddleware(userController.loginWithPassword)
  );

  // Forgot password
  fastify.post(
    "/forgot-password",
    { preValidation: [validateMiddleware(forgotPasswordDto)] },
    userController.forgotPassword
  );

  // Reset password
  fastify.post(
    "/reset-password",
    { preValidation: [validateMiddleware(resetPasswordDto)] },
    userController.resetPassword
  );

  // Update profile
  fastify.put(
    "/profile",
    { preValidation: [fastify.auth, validateMiddleware(updateProfileDto)] },
    userController.updateProfile
  );

  // Upload profile image
  fastify.post(
    "/profile/image",
    { preValidation: [fastify.auth] },
    userController.uploadProfileImage
  );

  // Get profile
  fastify.get(
    "/profile",
    { preValidation: [fastify.auth] },
    userController.getProfile
  );

  // Update feature access
  fastify.put(
    "/feature-access",
    {
      preValidation: [fastify.auth, validateMiddleware(updateFeatureAccessDto)],
    },
    userController.updateFeatureAccess
  );

  // Get currently logged-in user info
  fastify.get(
    "/me",
    { preValidation: [fastify.auth] },
    userController.getCurrentUser
  );

  // Get list of users (admin only)
  fastify.get(
    "/all",
    { preValidation: [fastify.auth, adminOnlyMiddleware] },
    userController.getUsers
  );

  // Refresh token
  fastify.post(
    "/refresh-token",
    { preValidation: [validateMiddleware(refreshTokenDto)] },
    userController.refreshToken
  );
};

module.exports = userRoutes;
