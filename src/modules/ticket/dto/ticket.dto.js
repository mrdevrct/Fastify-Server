// ticket.dto.js
const { z } = require("zod");

const createTicketDto = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  userId: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
  files: z
    .array(
      z.object({
        id: z.string().min(1, "File ID is required"),
        name: z.string().min(1, "File name is required"),
        size: z.number().min(1, "File size is required"),
        format: z.string().min(1, "File format is required"),
        path: z.string().min(1, "File path is required"),
      })
    )
    .optional(),
});

const sendMessageDto = z.object({
  ticketId: z.string().min(1, "Ticket ID is required"),
  messageText: z.string().optional(),
});

module.exports = {
  createTicketDto,
  sendMessageDto,
};
