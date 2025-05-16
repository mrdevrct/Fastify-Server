const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { ticketController } = require("../controller/ticket.controller");
const { createTicketDto } = require("../dto/ticket.dto");

const ticketRoutes = async (fastify, options) => {
  // Create ticket
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth, validateMiddleware(createTicketDto)],
    },
    ticketController.createTicket
  );

  // Get my tickets
  fastify.get(
    "/my-tickets",
    {
      preValidation: [fastify.auth],
    },
    ticketController.getMyTickets
  );

  // Get all tickets
  fastify.get(
    "/all-tickets",
    {
      preValidation: [fastify.auth],
    },
    ticketController.getAllTickets
  );

  // Get ticket messages
  fastify.get(
    "/:ticketId",
    {
      preValidation: [fastify.auth],
    },
    ticketController.getTicketMessages
  );

  // Update ticket
  fastify.put(
    "/:ticketId",
    {
      preValidation: [fastify.auth],
    },
    ticketController.updateTicket
  );

  // Send message
  fastify.post(
    "/message",
    {
      preValidation: [fastify.auth],
    },
    ticketController.sendMessage
  );

  // Reply to ticket
  fastify.post(
    "/reply",
    {
      preValidation: [fastify.auth],
    },
    ticketController.replyToTicket
  );

  // Mark messages as read
  fastify.put(
    "/:ticketId/messages/read",
    {
      preValidation: [fastify.auth],
    },
    ticketController.markMessagesAsRead
  );
};

module.exports = ticketRoutes;
