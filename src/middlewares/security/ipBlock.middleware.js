// middlewares/security/ipBlock.middleware.js
const { formatResponse } = require("../../utils/response/formatResponse");
const {
  isBlocked,
  recordFailedAttempt,
  resetAttempts,
} = require("../../utils/security/ipBlocker");

function ipBlockMiddleware(controller) {
  return async (request, reply) => {
    const ip = request.ip;

    if (isBlocked(ip)) {
      return reply
        .code(429)
        .send(
          formatResponse(
            null,
            false,
            "Too many failed attempts. Please try again later.",
            400
          )
        );
    }

    const result = await controller(request, reply);

    if (!result || (result.meta && result.meta.has_error === true)) {
      recordFailedAttempt(ip);
    } else {
      resetAttempts(ip);
    }

    console.log("recordFailedAttempt:", ip);
    console.log("isBlocked:", ip, isBlocked(ip));

    return result;
  };
}

module.exports = ipBlockMiddleware;
