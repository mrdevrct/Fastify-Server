const fastify = require("fastify")({ logger: false, trustProxy: true });
const setupMiddlewares = require("./middlewares");
const setupInterceptors = require("./interceptors");
const setupRoutes = require("./modules");
const setupWebsocket = require("./websocket");
const setupPlugins = require("./configs/plugins");

const setupApp = async () => {
  await setupPlugins(fastify); // Register core plugins (auth, upload, ws, static, logger)
  await setupMiddlewares(fastify); // Middleware setup
  await setupInterceptors(fastify); // Interceptors (hooks, error handling)
  await setupRoutes(fastify); // API routes
  await setupWebsocket(fastify); // WebSocket endpoint

  return fastify;
};

module.exports = setupApp;
