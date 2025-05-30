const { paymentController } = require("../controller/payment.controller");
const { paymentJsonSchema } = require("../model/schema/payment.schema");

const paymentRoutes = async (fastify, options) => {
  // Create payment
  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new payment (requires user authentication)",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        body: {
          type: "object",
          properties: {
            orderId: { type: "string", description: "Associated order ID" },
            amount: { type: "number", description: "Payment amount" },
            paymentMethod: { type: "string", description: "Payment method" },
          },
          required: ["orderId", "amount", "paymentMethod"],
        },
        response: {
          201: {
            description: "Payment created successfully",
            type: "object",
            properties: { data: paymentJsonSchema },
          },
          400: {
            description:
              "Invalid request (e.g., missing orderId, amount, or paymentMethod)",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    paymentController.createPayment
  );

  // Get payment by ID
  fastify.get(
    "/:paymentId",
    {
      schema: {
        description: "Get a payment by ID (requires user authentication)",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            paymentId: { type: "string", description: "Payment ID" },
          },
          required: ["paymentId"],
        },
        response: {
          200: {
            description: "Payment details",
            type: "object",
            properties: { data: paymentJsonSchema },
          },
          400: {
            description: "Invalid request or payment not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    paymentController.getPayment
  );

  // Get all user payments
  fastify.get(
    "/user-payments",
    {
      schema: {
        description:
          "Get all payments for the authenticated user (requires user authentication)",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        response: {
          200: {
            description: "List of user payments",
            type: "object",
            properties: {
              data: {
                type: "array",
                items: paymentJsonSchema,
              },
            },
          },
          400: {
            description: "Invalid request",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    paymentController.getUserPayments
  );

  // Update payment status
  fastify.put(
    "/:paymentId/status",
    {
      schema: {
        description: "Update payment status (requires user authentication)",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            paymentId: { type: "string", description: "Payment ID" },
          },
          required: ["paymentId"],
        },
        body: {
          type: "object",
          properties: {
            status: {
              type: "string",
              enum: ["PENDING", "SUCCESS", "FAILED"],
              description: "New payment status",
            },
            transactionId: {
              type: "string",
              description: "Transaction ID",
              nullable: true,
            },
          },
          required: ["status"],
        },
        response: {
          200: {
            description: "Payment status updated successfully",
            type: "object",
            properties: { data: paymentJsonSchema },
          },
          400: {
            description:
              "Invalid request (e.g., missing status, payment not found)",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    paymentController.updatePaymentStatus
  );

  // Process payment
  fastify.post(
    "/:paymentId/process",
    {
      schema: {
        description: "Process a payment (requires user authentication)",
        tags: ["Payments"],
        security: [{ bearerAuth: [] }],
        params: {
          type: "object",
          properties: {
            paymentId: { type: "string", description: "Payment ID" },
          },
          required: ["paymentId"],
        },
        response: {
          200: {
            description: "Payment processed successfully",
            type: "object",
            properties: { data: paymentJsonSchema },
          },
          400: {
            description: "Invalid request or payment not found",
            type: "object",
            properties: { error: { type: "string" } },
          },
          401: {
            description:
              "Unauthorized: Invalid or missing authentication token",
            type: "object",
            properties: { error: { type: "string" } },
          },
        },
      },
      preValidation: [fastify.auth],
    },
    paymentController.processPayment
  );
};

module.exports = paymentRoutes;
