const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const RefreshToken = require("../../modules/user/model/refreshToken.model");

/**
 * Generates a 6-digit numeric verification code (e.g., for email or password confirmation).
 * @returns {string} A 6-digit numeric string
 */
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generates a default username based on the current date.
 * Format: user-YYYYMMDD (e.g., user-20250515)
 * @returns {string} A default username string
 */
const generateDefaultUsername = () => {
  const date = new Date();
  const dateString = date.toISOString().slice(0, 10).replace(/-/g, "");
  return `user-${dateString}`;
};

/**
 * Generates a JWT access token for a given user.
 * Token expires in 1 day.
 * @param {Object} user - User object containing _id and email
 * @returns {string} Signed JWT access token
 */
const generateToken = (user) => {
  return jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });
};

/**
 * Creates and stores a refresh token for a given user in the database.
 * The token is valid for 7 days.
 * @param {string} userId - MongoDB user ID
 * @returns {{ token: string, expiresAt: Date }} The token string and its expiration date
 */
const generateRefreshToken = async (userId) => {
  const token = crypto.randomBytes(40).toString("hex");
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const refreshToken = new RefreshToken({
    userId,
    token,
    expiresAt,
  });

  await refreshToken.save();
  return { token, expiresAt };
};

module.exports = {
  generateVerificationCode,
  generateDefaultUsername,
  generateToken,
  generateRefreshToken,
};
