const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { userController } = require("../controller/user.controller");
const {
  authDto,
  verifyCodeDto,
  loginWithPasswordDto,
  updateProfileDto,
  updateFeatureAccessDto,
  refreshTokenDto,
} = require("../dto/user.dto");

// میان‌افزار برای بررسی دسترسی ادمین
const adminOnlyMiddleware = async (request, reply) => {
  const user = await require("../service/user.service").userService.findById(
    request.user.id
  );
  if (
    user.userType !== "ADMIN" ||
    !["ADMIN", "SUPER_ADMIN"].includes(user.adminStatus)
  ) {
    reply.code(403).send({ error: "Access denied: Admin only" });
  }
};

const userRoutes = async (fastify, options) => {
  // ثبت‌نام یا ورود با ایمیل
  fastify.post(
    "/auth",
    { preValidation: [validateMiddleware(authDto)] },
    userController.auth
  );

  // تأیید کد
  fastify.post(
    "/verify",
    { preValidation: [validateMiddleware(verifyCodeDto)] },
    userController.verifyCode
  );

  // ورود با رمز عبور
  fastify.post(
    "/login",
    { preValidation: [validateMiddleware(loginWithPasswordDto)] },
    userController.loginWithPassword
  );

  // به‌روزرسانی پروفایل
  fastify.put(
    "/profile",
    { preValidation: [fastify.auth, validateMiddleware(updateProfileDto)] },
    userController.updateProfile
  );

  // آپلود تصویر پروفایل
  fastify.post(
    "/profile/image",
    { preValidation: [fastify.auth] },
    userController.uploadProfileImage
  );

  // دریافت پروفایل
  fastify.get(
    "/profile",
    { preValidation: [fastify.auth] },
    userController.getProfile
  );

  // به‌روزرسانی دسترسی‌های فیچر
  fastify.put(
    "/feature-access",
    {
      preValidation: [fastify.auth, validateMiddleware(updateFeatureAccessDto)],
    },
    userController.updateFeatureAccess
  );

  // دریافت اطلاعات کاربر لاگین‌شده
  fastify.get(
    "/me",
    { preValidation: [fastify.auth] },
    userController.getCurrentUser
  );

  // دریافت لیست کاربران (فقط برای ادمین‌ها)
  fastify.get(
    "/all",
    { preValidation: [fastify.auth, adminOnlyMiddleware] },
    userController.getUsers
  );

  // رفرش توکن
  fastify.post(
    "/refresh-token",
    { preValidation: [validateMiddleware(refreshTokenDto)] },
    userController.refreshToken
  );
};

module.exports = userRoutes;
