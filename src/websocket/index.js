const { logger } = require("../utils/logger/logger");

const setupWebsocket = async (fastify) => {
  fastify.get("/ws", { websocket: true }, (connection, req) => {
    const clientIP = req.headers["x-forwarded-for"] || req.socket.remoteAddress;

    logger.info(`🔌 WebSocket connection established from ${clientIP}`);

    connection.socket.on("message", (message) => {
      const msg = message.toString();
      logger.info(`📨 WebSocket message received: ${msg}`);
      connection.socket.send(`Echo: ${msg}`);
    });

    connection.socket.on("close", () => {
      logger.info(`❌ WebSocket connection closed from ${clientIP}`);
    });

    connection.socket.on("error", (err) => {
      logger.error(`⚠️ WebSocket error from ${clientIP}: ${err.message}`);
    });
  });

  logger.info("✅ WebSocket endpoint configured at ws://localhost:8080/ws");
};

module.exports = setupWebsocket;
