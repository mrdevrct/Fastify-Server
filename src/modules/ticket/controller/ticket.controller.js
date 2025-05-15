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

  sendMessage: async (request, reply) => {
    try {
      const user = request.user;

      const parts = request.parts(); // Get all parts of the form-data
      let ticketId = request.query.ticketId;
      let messageText = "";
      let filesData = [];

      // Parse form fields and files
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
        { messageText, files: uploadedFiles },
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
};

module.exports = { ticketController };
