const path = require("path");
const multipart = require("@fastify/multipart");
const websocket = require("@fastify/websocket");
const staticPlugin = require("@fastify/static");
const { requestLogger, logger } = require("../utils/logger/logger");
const authMiddleware = require("../middlewares/auth/auth.middleware");
const { config } = require("./env");

const setupPlugins = async (fastify) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: (config.upload_max_file_size_mb || 5) * 1024 * 1024,
      files:  1,
    },
  });

  // Serve static files from /uploads folder
  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "..", "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  // Log served static files
  fastify.addHook("onSend", async (request, reply, payload) => {
    if (request.raw.url.startsWith("/uploads/") && reply.statusCode === 200) {
      logger.info(`🧾 Static file served: ${request.raw.url}`);
    }
  });

  // WebSocket support
  await fastify.register(websocket);

  // Custom request logger
  await fastify.register(requestLogger);

  // Auth decorator
  fastify.decorate("auth", authMiddleware);
};

module.exports = setupPlugins;
