const path = require("path");
const multipart = require("@fastify/multipart");
const staticPlugin = require("@fastify/static");
const { requestLogger, logger } = require("../utils/logger/logger");
const authMiddleware = require("../middlewares/auth/auth.middleware");
const fastifySwagger = require("@fastify/swagger");
const fastifySwaggerUi = require("@fastify/swagger-ui");

const setupPlugins = async (fastify) => {
  // Register multipart for file uploads
  await fastify.register(multipart, {
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
      files: 3,
    },
  });

  // Serve static files from /uploads folder
  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "..", "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });

  // Custom request logger
  await fastify.register(requestLogger);

  // Auth decorator
  fastify.decorate("auth", authMiddleware);

  // Compute server URL based on environment
  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host =
    process.env.NODE_ENV === "production"
      ? process.env.HOST || "yourdomain.com"
      : `localhost:${process.env.PORT || 8081}`;
  const serverUrl = `${protocol}://${host}`;

  // Register Swagger for API documentation
  await fastify.register(fastifySwagger, {
    openapi: {
      info: {
        title: "API Documentation",
        description: "API documentation for the Node.js Fastify application",
        version: "1.0.0",
      },
      servers: [
        {
          url: serverUrl,
          description: "Application server",
        },
      ],
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
    },
  });

  // Register Swagger UI
  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transform: (schema) => {
      // Use the same resolved server URL
      const resolvedSchema = { ...schema };
      resolvedSchema.servers = [
        {
          url: serverUrl,
          description: "Application server",
        },
      ];
      return resolvedSchema;
    },
  });

  logger.info("Swagger plugins registered");
};

module.exports = setupPlugins;
