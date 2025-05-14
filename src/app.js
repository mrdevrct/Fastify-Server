const fastify = require("fastify")({ logger: false });
const websocket = require("@fastify/websocket");
const setupMiddlewares = require("./middlewares");
const setupInterceptors = require("./interceptors");
const setupRoutes = require("./modules");
const setupWebsocket = require("./websocket");
const { requestLogger } = require("./utils/logger/logger");
const authMiddleware = require("./middlewares/auth/auth.middleware");
const multipart = require("@fastify/multipart");
const static = require("@fastify/static");

const setupApp = async () => {
  await fastify.register(multipart, {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB
      files: 1, // فقط یک فایل در هر درخواست
    },
  });

  await fastify.register(websocket);
  await fastify.register(requestLogger);
  fastify.decorate("auth", authMiddleware);
  await setupMiddlewares(fastify);
  await setupInterceptors(fastify);
  await setupRoutes(fastify);
  await setupWebsocket(fastify);

  return fastify;
};

module.exports = setupApp;
