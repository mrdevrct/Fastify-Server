// ticket.route.js
const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { ticketController } = require("../controller/ticket.controller");
const { createTicketDto, sendMessageDto } = require("../dto/ticket.dto");

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
      preValidation: [fastify.auth, validateMiddleware(sendMessageDto)],
    },
    ticketController.sendMessage
  );

  // Upload ticket file
  fastify.post(
    "/file",
    {
      preValidation: [fastify.auth],
    },
    ticketController.uploadTicketFile
  );
};

module.exports = ticketRoutes;
