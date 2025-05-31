const path = require("path");
const multipart = require("@fastify/multipart");
const staticPlugin = require("@fastify/static");
const { requestLogger, logger } = require("../utils/logger/logger");
const authMiddleware = require("../middlewares/auth/auth.middleware");
const fastifySwagger = require("@fastify/swagger");
const fastifySwaggerUi = require("@fastify/swagger-ui");

const setupPlugins = async (fastify) => {
  console.log("Starting plugin registration");

  await fastify.register(multipart, {
    attachFieldsToBody: false,
    limits: {
      fileSize: 20 * 1024 * 1024, // 20MB
      files: 3,
    },
  });
  console.log("Multipart plugin registered");

  await fastify.register(staticPlugin, {
    root: path.join(__dirname, "..", "uploads"),
    prefix: "/uploads/",
    decorateReply: false,
  });
  console.log("Static plugin registered");

  await fastify.register(requestLogger);
  console.log("Request logger plugin registered");

  fastify.decorate("auth", authMiddleware);
  console.log("Auth decorator registered");

  const protocol = process.env.NODE_ENV === "production" ? "https" : "http";
  const host =
    process.env.NODE_ENV === "production"
      ? process.env.HOST || "yourdomain.com"
      : `localhost:${process.env.PORT || 8081}`;
  const serverUrl = `${protocol}://${host}`;

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
  console.log("Swagger plugin registered");

  await fastify.register(fastifySwaggerUi, {
    routePrefix: "/swagger",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
    transform: (schema) => {
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
  console.log("Swagger UI plugin registered");

  logger.info("All plugins registered successfully");
};

module.exports = setupPlugins;
