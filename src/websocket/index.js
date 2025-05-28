const websocket = require("@fastify/websocket");
const { logger } = require("../utils/logger/logger");
const {
  notificationService,
} = require("../modules/notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../utils/notification/notification.enums");

const setupWebsocket = async (fastify) => {
  await fastify.register(websocket, {
    options: {
      maxPayloadLength: 1048576, // 1MB
    },
  });

  fastify.register(async function (fastify) {
    // مسیر WebSocket عمومی
    fastify.get(
      "/ws/notifications/public",
      { websocket: true },
      (connection, req) => {
        logger.info(`Public WebSocket client connected: ${req.ip}`);

        // تنظیم برای ping/pong
        connection.isAlive = true;

        // ارسال پیام خوش‌آمدگویی
        try {
          connection.send(
            JSON.stringify({
              event: "connection",
              message: "Connected to public notification WebSocket",
              timestamp: new Date().toISOString(),
            })
          );
          logger.info(`Welcome message sent to client: ${req.ip}`);
        } catch (error) {
          logger.error(`Error sending welcome message: ${error.message}`);
          return;
        }

        // ping/pong برای حفظ اتصال
        const pingInterval = setInterval(() => {
          if (connection.isAlive === false) {
            logger.warn(
              `Public WebSocket client disconnected due to ping timeout: ${req.ip}`
            );
            connection.terminate();
            clearInterval(pingInterval);
            return;
          }
          try {
            connection.isAlive = false;
            connection.send(JSON.stringify({ event: "ping" }));
          } catch (error) {
            logger.error(`Error sending ping: ${error.message}`);
            clearInterval(pingInterval);
            connection.terminate();
          }
        }, 10000);

        connection.on("message", (message) => {
          try {
            const parsedMessage = JSON.parse(message.toString());
            if (parsedMessage.event === "pong") {
              connection.isAlive = true;
              logger.debug(`Pong received from public client: ${req.ip}`);
            }
          } catch (error) {
            logger.error(`Error parsing WebSocket message: ${error.message}`);
          }
        });

        connection.on("close", (code, reason) => {
          logger.info(
            `Public WebSocket client disconnected: ${
              req.ip
            }, Code: ${code}, Reason: ${reason || "Unknown"}`
          );
          clearInterval(pingInterval);
        });

        connection.on("error", (error) => {
          logger.error(`Public WebSocket error: ${error.message}`);
          clearInterval(pingInterval);
        });
      }
    );

    // Endpoint تست برای ارسال نوتیفیکیشن
    fastify.post(
      "/ws/notifications/test",
      { preValidation: [fastify.auth] },
      async (request, reply) => {
        try {
          const { message, data } = request.body || {};
          const adminId = request.user.id;

          await notificationService.createAndSendNotification(
            fastify,
            adminId,
            NOTIFICATION_TYPES.GENERAL_NOTIFICATION,
            message || "Test notification",
            data || {
              testId: "12345",
              description: "This is a test notification",
              timestamp: new Date().toISOString(),
            }
          );

          return reply.status(200).send({
            success: true,
            message: "Test notification sent",
          });
        } catch (error) {
          logger.error(`Error sending test notification: ${error.message}`);
          return reply.status(500).send({
            success: false,
            error: error.message,
          });
        }
      }
    );
  });

  logger.info("WebSocket server initialized");
};

module.exports = setupWebsocket;
