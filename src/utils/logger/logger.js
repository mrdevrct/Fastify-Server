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
  level: "info",
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
            metadata.status
          } | ⏱️ Ping: ${metadata.ping}ms`;
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
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/error.log", level: "error" }),
    new winston.transports.File({ filename: "logs/combined.log" }),
  ],
});

if (!fs.existsSync("logs")) {
  fs.mkdirSync("logs");
}

// یک پلاگین ساده برای Fastify
const requestLogger = async (fastify) => {
  fastify.addHook("onRequest", async (request) => {
    logger.info("Incoming request", {
      method: request.method,
      url: request.url,
    });
  });
};

module.exports = {
  logger,
  requestLogger,
};
