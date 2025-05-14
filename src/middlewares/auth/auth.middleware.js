const jwt = require("jsonwebtoken");
const { logger } = require("../../utils/logger/logger");
const { formatResponse } = require("../../utils/response/formatResponse");
const User = require("../../modules/user/model/user.model");

const authMiddleware = async (request, reply) => {
  try {
    const token = request.headers.authorization?.replace("Bearer ", "");
    if (!token) {
      logger.warn("No token provided in request");
      return reply
        .status(401)
        .send(formatResponse({}, true, "No token provided", 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    logger.debug(`Token decoded: ${JSON.stringify(decoded)}`);

    const user = await User.findById(decoded.id);
    if (!user) {
      logger.warn(`Invalid token: User not found for ID ${decoded.id}`);
      return reply
        .status(401)
        .send(formatResponse({}, true, "Invalid token", 401));
    }

    if (user.isBanned) {
      logger.warn(`Banned user attempted access: ${user.email}`);
      return reply
        .status(403)
        .send(formatResponse({}, true, "Your account is banned", 403));
    }

    request.user = { id: user._id, email: user.email };
    logger.debug(`User authenticated: ${user.email}`);
  } catch (error) {
    logger.error(`Auth middleware error: ${error.message}`);
    return reply
      .status(401)
      .send(formatResponse({}, true, "Invalid or expired token", 401));
  }
};

module.exports = authMiddleware;
