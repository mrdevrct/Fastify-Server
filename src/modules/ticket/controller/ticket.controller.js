// ticket.controller.js
const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/uploader");
const { ticketService } = require("../service/ticket.service");

const ticketController = {
  createTicket: async (request, reply) => {
    try {
      const ticketData = request.body;
      const user = request.user;

      if (user.userType === "ADMIN" && user.adminStatus === "SUPER_ADMIN") {
        return reply
          .status(403)
          .send(
            formatResponse({}, true, "SUPER_ADMIN cannot create tickets", 403)
          );
      }

      const newTicket = await ticketService.createTicket(ticketData, user);
      logger.info(`Ticket created by user: ${user.email}`);
      return reply
        .status(201)
        .send(formatResponse(newTicket, false, null, 201));
    } catch (error) {
      logger.error(`Error creating ticket: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  sendMessage: async (request, reply) => {
    try {
      const { ticketId, messageText } = request.body;
      const user = request.user;

      const ticket = await ticketService.sendMessage(
        ticketId,
        { messageText },
        user
      );

      logger.info(`Message sent to ticket ${ticketId} by user: ${user.email}`);
      return reply.status(200).send(formatResponse(ticket, false, null, 200));
    } catch (error) {
      logger.error(`Error sending message: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  uploadTicketFile: async (request, reply) => {
    try {
      const data = await request.file();
      if (!data) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "No file uploaded", 400));
      }

      // Ensure file size is available
      const fileBuffer = await data.toBuffer();
      const fileSize = fileBuffer.length; // Get size from buffer length
      if (!fileSize || fileSize === 0) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "File size is invalid", 400));
      }

      const { ticketId } = request.query;
      if (!ticketId) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Ticket ID is required", 400));
      }

      const user = request.user;
      const fileData = await fileUploader.uploadTicketFile(
        { ...data, size: fileSize, fileBuffer }, // Pass fileBuffer and size explicitly
        user,
        ticketId
      );
      const updatedTicket = await ticketService.addFileToTicket(
        ticketId,
        fileData,
        user
      );

      logger.info(`File uploaded to ticket ${ticketId} by user: ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(updatedTicket, false, null, 200));
    } catch (error) {
      logger.error(`Error uploading ticket file: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { ticketController };
