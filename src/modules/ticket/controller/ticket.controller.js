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
            formatResponse(
              {},
              true,
              "SUPER_ADMIN is not allowed to create tickets",
              403
            )
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

  getMyTickets: async (request, reply) => {
    try {
      const user = request.user;

      const myTicketsAccess = user.featureAccess.find(
        (f) => f.feature === "MY_TICKETS"
      );
      if (!myTicketsAccess || myTicketsAccess.access !== "FULL_ACCESS") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "You do not have access to your tickets",
              403
            )
          );
      }

      const tickets = await ticketService.getMyTickets(user);
      const sanitizedTickets = tickets.map((ticket) => ({
        ...ticket.toObject(),
        messages: [],
      }));

      logger.info(`Tickets retrieved for user ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(sanitizedTickets, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving user tickets: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getAllTickets: async (request, reply) => {
    try {
      const user = request.user;

      const allTicketsAccess = user.featureAccess.find(
        (f) => f.feature === "ALL_TICKETS"
      );
      if (!allTicketsAccess || allTicketsAccess.access !== "FULL_ACCESS") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "You do not have access to all tickets",
              403
            )
          );
      }

      const tickets = await ticketService.getAllTickets();
      const sanitizedTickets = tickets.map((ticket) => ({
        ...ticket.toObject(),
        messages: [],
      }));

      logger.info(`All tickets retrieved by user ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(sanitizedTickets, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving all tickets: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getTicketMessages: async (request, reply) => {
    try {
      const user = request.user;
      const { ticketId } = request.params;

      const messages = await ticketService.getTicketMessages(ticketId, user);

      await ticketService.markMessagesAsRead(ticketId, user);

      logger.info(`Messages fetched for ticket ${ticketId} by ${user.email}`);
      return reply.status(200).send(formatResponse(messages, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching messages: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updateTicket: async (request, reply) => {
    try {
      const user = request.user;
      const { ticketId } = request.params;
      const updateFields = request.body;

      const ticket = await ticketService.updateTicket(
        ticketId,
        updateFields,
        user
      );

      logger.info(`Ticket ${ticketId} updated by user ${user.email}`);
      return reply.status(200).send(formatResponse(ticket, false, null, 200));
    } catch (error) {
      logger.error(`Error updating ticket: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  sendMessage: async (request, reply) => {
    try {
      const user = request.user;
      const parts = request.parts();
      let ticketId = request.query.ticketId;
      let messageText = "";
      let filesData = [];
      let replyTo = null;

      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "files") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize || fileSize === 0) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid file size", 400));
          }
          filesData.push({ ...part, size: fileSize, fileBuffer });
        } else {
          if (part.fieldname === "ticketId") ticketId = part.value;
          if (part.fieldname === "messageText") messageText = part.value;
          if (part.fieldname === "replyTo") replyTo = part.value;
        }
      }

      if (!ticketId) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Ticket ID is required", 400));
      }

      if (filesData.length > 3) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "You can upload up to 3 files", 400));
      }

      let uploadedFiles = [];
      if (filesData.length > 0) {
        uploadedFiles = await fileUploader.uploadTicketFiles(
          filesData,
          user,
          ticketId
        );
      }

      const ticket = await ticketService.sendMessage(
        ticketId,
        { messageText, files: uploadedFiles, replyTo },
        user
      );

      logger.info(
        `Message sent to ticket ${ticketId} by user ${user.email}${
          uploadedFiles.length > 0 ? " with attachments" : ""
        }`
      );
      return reply.status(200).send(formatResponse(ticket, false, null, 200));
    } catch (error) {
      logger.error(`Error sending message: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  replyToTicket: async (request, reply) => {
    try {
      const user = request.user;
      const { ticketId, messageText, replyTo } = request.body;

      if (!ticketId || !messageText) {
        return reply
          .status(400)
          .send(
            formatResponse(
              {},
              true,
              "ticketId and messageText are required",
              400
            )
          );
      }

      const ticket = await ticketService.replyToTicket(
        ticketId,
        messageText,
        user,
        replyTo
      );

      logger.info(`Reply sent to ticket ${ticketId} by user ${user.email}`);
      return reply.status(200).send(formatResponse(ticket, false, null, 200));
    } catch (error) {
      logger.error(`Error replying to ticket: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  markMessagesAsRead: async (request, reply) => {
    try {
      const user = request.user;
      const { ticketId } = request.params;

      await ticketService.markMessagesAsRead(ticketId, user);

      logger.info(
        `Messages marked as read for ticket ${ticketId} by ${user.email}`
      );
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error marking messages as read: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { ticketController };
