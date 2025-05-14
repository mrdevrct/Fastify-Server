const User = require("../model/user.model");
const RefreshToken = require("../model/refreshToken.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { logger } = require("../../../utils/logger/logger");
const { sendVerificationCode } = require("../../../utils/sendEmail/email");
const defaultFeatures = require("../../../configs/defaultFeatures");

const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateDefaultUsername = () => {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `user-${dateString}`;
};

const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 روز
  const refreshToken = new RefreshToken({
    userId,
    token,
    expiresAt,
  });
  await refreshToken.save();
  return { token, expiresAt };
};

const userService = {
  // ثبت‌نام یا ورود با ایمیل
  auth: async ({ email }) => {
    try {
      let user = await User.findOne({ email });
      const code = generateVerificationCode();
      const expires = new Date(Date.now() + 10 * 60 * 1000);

      if (!user) {
        let username = generateDefaultUsername();
        let usernameIndex = 1;
        while (await User.findOne({ username })) {
          username = `${generateDefaultUsername()}-${usernameIndex}`;
          usernameIndex++;
        }

        user = new User({
          username,
          email,
          verificationCode: code,
          verificationCodeExpires: expires,
          featureAccess: defaultFeatures,
        });
        logger.info(`New user created: ${email} with username ${username}`);
      } else {
        user.verificationCode = code;
        user.verificationCodeExpires = expires;
        logger.info(`Login attempt for existing user: ${email}`);
      }

      await user.save();

      // ارسال ایمیل بدون انتظار (fire-and-forget)
      sendVerificationCode(user.email, code)
        .then(() => {
          logger.info(`Verification code sent to ${user.email}`);
        })
        .catch((emailError) => {
          logger.warn(
            `Failed to send verification email to ${user.email}: ${emailError.message}`
          );
          logger.info(`Verification code for ${user.email}: ${code}`);
        });

      return user;
    } catch (error) {
      logger.error(`Error in auth: ${error.message}`);
      throw error;
    }
  },

  // تأیید کد
  verifyCode: async ({ email, code }) => {
    const user = await User.findOne({
      email,
      verificationCode: code,
      verificationCodeExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new Error("Invalid or expired verification code");
    }

    user.verificationCode = undefined;
    user.verificationCodeExpires = undefined;
    user.adminStatus =
      user.adminStatus === "PENDING" ? "USER_REGISTRED" : user.adminStatus;
    await user.save();

    const { token: refreshToken, expiresAt } = await generateRefreshToken(
      user._id
    );
    return { user, refreshToken, refreshTokenExpires: expiresAt };
  },

  // ورود با رمز عبور
  loginWithPassword: async ({ email, password }) => {
    const user = await User.findOne({ email });
    if (!user || !user.password) {
      throw new Error("Invalid credentials or password not set");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    const { token: refreshToken, expiresAt } = await generateRefreshToken(
      user._id
    );
    return { user, refreshToken, refreshTokenExpires: expiresAt };
  },

  // به‌روزرسانی پروفایل
  updateProfile: async (userId, profileData) => {
    const updateData = { ...profileData };
    if (profileData.password) {
      updateData.password = await bcrypt.hash(profileData.password, 10);
    }
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  },

  // دریافت پروفایل
  getProfile: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  // به‌روزرسانی دسترسی‌های فیچر
  updateFeatureAccess: async (userId, featureAccessData) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    featureAccessData.forEach((newAccess) => {
      const feature = user.featureAccess.find(
        (f) => f.feature === newAccess.feature
      );
      if (feature) {
        feature.access = newAccess.access;
      } else {
        user.featureAccess.push(newAccess);
      }
    });

    await user.save();
    return user;
  },

  // دریافت اطلاعات کاربر لاگین‌شده
  getCurrentUser: async (userId) => {
    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }
    return user;
  },

  // دریافت لیست کاربران
  getUsers: async (currentUserId, page, perPage) => {
    const currentUser = await User.findById(currentUserId);
    if (!currentUser) {
      throw new Error("Current user not found");
    }

    let query = { _id: { $ne: currentUserId } };
    if (currentUser.adminStatus === "ADMIN") {
      query.adminStatus = { $ne: "SUPER_ADMIN" };
    }

    const total = await User.countDocuments(query);

    const users = await User.find(query)
      .select(
        "_id username email lastName firstName userType adminStatus profilePath reportCount isBanned featureAccess"
      )
      .sort({ createdAt: -1 }) // مرتب‌سازی از جدید به قدیم
      .skip((page - 1) * perPage)
      .limit(perPage);

    const formattedUsers = users.map((user) => ({
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
    }));

    return { users: formattedUsers, total };
  },

  // دریافت کاربر با شناسه
  findById: async (id) => {
    return await User.findById(id);
  },

  // اعتبارسنجی و رفرش توکن
  refreshToken: async ({ refreshToken }) => {
    const token = await RefreshToken.findOne({
      token: refreshToken,
      expiresAt: { $gt: new Date() },
    }).populate("userId");

    if (!token || !token.userId) {
      throw new Error("Invalid or expired refresh token");
    }

    if (token.userId.isBanned) {
      throw new Error("User is banned");
    }

    const accessToken = jwt.sign(
      { id: token.userId._id, email: token.userId.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // به‌روزرسانی رفرش توکن
    await RefreshToken.deleteOne({ _id: token._id });
    const { token: newRefreshToken, expiresAt } = await generateRefreshToken(
      token.userId._id
    );

    return {
      user: token.userId,
      accessToken,
      refreshToken: newRefreshToken,
      refreshTokenExpires: expiresAt,
    };
  },
};

module.exports = { userService };
