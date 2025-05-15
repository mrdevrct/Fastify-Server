const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { ticketController } = require("../controller/ticket.controller");
const {
  createTicketDto,
} = require("../dto/ticket.dto");

const ticketRoutes = async (fastify, options) => {
  // Create ticket
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth, validateMiddleware(createTicketDto)],
    },
    ticketController.createTicket
  );

  // Send message
  fastify.post(
    "/message",
    {
      preValidation: [fastify.auth],
    },
    ticketController.sendMessage
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
};

module.exports = ticketRoutes;
