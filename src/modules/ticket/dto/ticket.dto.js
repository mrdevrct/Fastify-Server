// ticket.dto.js
const { z } = require("zod");

const createTicketDto = z.object({
  title: z.string().min(1, "Title is required"),
  category: z.string().min(1, "Category is required"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("LOW"),
  userId: z.string().optional(),
  email: z.string().email().optional(),
  username: z.string().optional(),
});

module.exports = {
  createTicketDto,
};
