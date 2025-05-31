const winston = require("winston");
const emoji = require("node-emoji");
const fs = require("fs");

const formatTimestamp = () =>
  new Date().toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

const logger = winston.createLogger({
  level: "debug", // سطح debug برای گرفتن همه لاگ‌ها
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
    winston.format.printf(
      ({ level, message, timestamp, stack, ...metadata }) => {
        let emojiIcon = "";
        let logMessage = "";

        switch (level) {
          case "info":
            emojiIcon = emoji.get("information_source");
            break;
          case "error":
            emojiIcon = emoji.get("exclamation");
            break;
          case "warn":
            emojiIcon = emoji.get("warning");
            break;
          case "debug":
            emojiIcon = emoji.get("bug");
            break;
          default:
            emojiIcon = emoji.get("grey_question");
        }

        if (metadata.method && metadata.url) {
          const statusIcon =
            metadata.status >= 400
              ? emoji.get("x")
              : emoji.get("white_check_mark");
          const methodIcon =
            {
              GET: emoji.get("mag"),
              POST: emoji.get("new"),
              PUT: emoji.get("pencil2"),
              DELETE: emoji.get("wastebasket"),
            }[metadata.method] || emoji.get("question");

          logMessage = `${emojiIcon} [${level.toUpperCase()}] ${formatTimestamp()} | ${methodIcon} ${
            metadata.method
          } ${metadata.url} | ${statusIcon} Status: ${
            metadata.status || "N/A"
          } | ⏱️ Ping: ${metadata.ping || "N/A"}ms`;
        } else {
          if (level === "error" && stack) {
            const stackLines = stack.split("\n");
            const errorLocation = stackLines[1]
              ? stackLines[1].trim()
              : "Unknown location";
            logMessage = `${emojiIcon} [${level.toUpperCase()}] ${formatTimestamp()} | Error: ${message} | Location: ${errorLocation}`;
          } else {
            logMessage = `${emojiIcon} [${level.toUpperCase()}] ${formatTimestamp()} | ${message}`;
          }
        }

        return logMessage;
      }
    )
  ),
  transports: [
    new winston.transports.Console({ level: "debug" }), // لاگ debug به کنسول
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({
      filename: "logs/combined.log",
      level: "debug",
    }),
    new winston.transports.File({
      filename: "logs/success.log",
      level: "info",
    }), // فایل برای لاگ‌های موفقیت
  ],
});

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// پلاگین برای Fastify
const requestLogger = async (fastify) => {
  console.log("🔍 Registering requestLogger hook");
  logger.debug("Registering requestLogger hook");

  // لاگ درخواست ورودی
  fastify.addHook("onRequest", async (request, reply) => {
    console.log(`🚀 onRequest: ${request.method} ${request.url}`);
    logger.info("Incoming request", {
      method: request.method,
      url: request.url,
      headers: request.headers,
      ip: request.ip,
    });
  });

  // لاگ درخواست‌های موفق
  fastify.addHook("onResponse", async (request, reply) => {
    if (reply.statusCode < 400) {
      // فقط برای پاسخ‌های موفق (200, 201, و غیره)
      console.log(
        `✅ onSuccess: ${request.method} ${request.url} | Status: ${reply.statusCode}`
      );
      logger.info("Request successful", {
        method: request.method,
        url: request.url,
        status: reply.statusCode,
        ping: reply.getResponseTime(),
        ip: request.ip,
      });
    }
  });

  // لاگ برای خطاها
  fastify.addHook("onError", async (request, reply, error) => {
    console.log(
      `❌ onError: ${request.method} ${request.url} | Error: ${error.message}`
    );
    logger.error("Request error", {
      method: request.method,
      url: request.url,
      error: error.message,
      stack: error.stack,
      status: reply.statusCode,
    });
  });
};

module.exports = {
  logger,
  requestLogger,
};
