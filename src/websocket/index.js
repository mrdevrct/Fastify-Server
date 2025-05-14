const { logger } = require("../utils/logger/logger");

const setupWebsocket = async (fastify) => {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    fastify.log.info("WebSocket connection established");
    connection.socket.on("message", (message) => {
      const msg = message.toString();
      connection.socket.send(`Echo: ${msg}`);
      fastify.log.info(`WebSocket message received: ${msg}`);
    });
    connection.socket.on("close", () => {
      fastify.log.info("WebSocket connection closed");
    });
    connection.socket.on("error", (err) => {
      fastify.log.error("WebSocket error:", err);
    });
  });

  logger.info("WebSocket configured");
};

module.exports = setupWebsocket;
