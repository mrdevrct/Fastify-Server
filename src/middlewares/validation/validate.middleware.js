const { formatResponse } = require("../../utils/response/formatResponse");
const { logger } = require("../../utils/logger/logger");

const validateMiddleware = (schema) => {
  return async (request, reply) => {
    try {
      await schema.parseAsync(request.body);
      return;
    } catch (error) {
      logger.error("Validation error:", error);
      const errorMessage = error.errors
        ? error.errors
            .map((err) => `${err.path.join(".")}: ${err.message}`)
            .join(", ")
        : "Invalid input";
      return reply
        .code(400)
        .send(formatResponse(null, true, errorMessage, 400));
    }
  };
};

module.exports = validateMiddleware;
