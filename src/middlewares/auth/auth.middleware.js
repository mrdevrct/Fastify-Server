const jwt = require("jsonwebtoken");
const { logger } = require("../../utils/logger/logger");
const { formatResponse } = require("../../utils/response/formatResponse");
const User = require("../../modules/user/model/user.model");

const authMiddleware = async (request, reply) => {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      return reply
        .status(401)
        .send(formatResponse({}, true, "No token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return reply
        .status(401)
        .send(formatResponse({}, true, "Invalid token", 401));
    }

    if (user.isBanned) {
      return reply
        .status(403)
        .send(formatResponse({}, true, "Your account is banned", 403));
    }

    request.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      userType: user.userType,
      adminStatus: user.adminStatus,
    };
  } catch (error) {
    logger.error(`Auth error: ${error.message}`);
    return reply
      .status(401)
      .send(formatResponse({}, true, "Invalid or expired token", 401));
  }
};

module.exports = authMiddleware;
