const path = require("path");
const multipart = require("@fastify/multipart");
const websocket = require("@fastify/websocket");
const staticPlugin = require("@fastify/static");
const { requestLogger, logger } = require("../utils/logger/logger");
const authMiddleware = require("../middlewares/auth/auth.middleware");

const setupPlugins = async (fastify) => {
  await fastify.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024,
      files: 3,
    },
  });

  // Serve static files from /uploads folder
  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "..", "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  // WebSocket support
  await fastify.register(websocket);

  // Custom request logger
  await fastify.register(requestLogger);

  // Auth decorator
  fastify.decorate("auth", authMiddleware);
};

module.exports = setupPlugins;
