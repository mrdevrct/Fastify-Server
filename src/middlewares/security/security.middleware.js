const fastifyHelmet = require("@fastify/helmet");
const fastifyRateLimit = require("@fastify/rate-limit");
const fastifyCors = require("@fastify/cors");
const { logger } = require("../../utils/logger/logger");

module.exports = async function setupSecurityMiddlewares(fastify) {
  await fastify.register(fastifyHelmet);
  logger.info("Helmet security headers enabled");

  await fastify.register(fastifyRateLimit, {
    max: 100,
    timeWindow: "1 minute",
  });
  logger.info("Rate limiting applied (100 reqs/min)");

  await fastify.register(fastifyCors, {
    origin: "*",
  });
  logger.info("CORS enabled");

  fastify.addHook("onRequest", async (request, reply) => {
    const contentType = request.headers["content-type"] || "";
    if (["POST", "PUT", "PATCH"].includes(request.method)) {
      const isJson = contentType.includes("application/json");
      const isForm = contentType.includes("multipart/form-data");

      if (!isJson && !isForm) {
        logger.warn("❌ Blocked request with unsupported content-type", {
          method: request.method,
          url: request.url,
          contentType,
        });

        return reply.code(400).send({
          success: false,
          error: "Unsupported content-type. Only JSON or FormData allowed.",
        });
      }
    }
  });

  logger.info("Security middlewares fully configured");
};
