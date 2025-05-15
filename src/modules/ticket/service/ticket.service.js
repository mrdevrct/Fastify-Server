const Ticket = require("../model/ticket.model");
const { logger } = require("../../../utils/logger/logger");

const ticketService = {
  createTicket: async (ticketData, user) => {
    if (user.userType === "ADMIN" && user.adminStatus === "SUPER_ADMIN") {
      throw new Error("SUPER_ADMIN is not allowed to create tickets");
    }

    const newTicket = new Ticket({
      title: ticketData.title,
      priority: ticketData.priority || "LOW",
      category: ticketData.category,
      userId: user.userType === "USER" ? user.id : null,
      email: user.userType === "USER" ? user.email : ticketData.email,
      username: user.userType === "USER" ? user.username : ticketData.username,
    });

    await newTicket.save();
    return newTicket;
  },

  sendMessage: async (ticketId, messageData, user) => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const newMessage = {
        isSender: user.userType === "USER",
        senderName: user.username,
        messageText: messageData.messageText || "",
        files: messageData.files || [],
        isRead: false,
        createdAt: new Date(),
      };

      ticket.messages.push(newMessage);
      ticket.updatedAt = new Date();
      await ticket.save();

      return ticket;
    } catch (error) {
      logger.error(`Error sending message: ${error.message}`);
      throw error;
    }
  },

  getMyTickets: async (user) => {
    try {
      const filter = {
        $or: [
          { userId: user.id }, // Tickets created by the user
          { email: user.email }, // Tickets associated with the user's email
        ],
      };

      // Apply query filters (e.g., pagination, sorting)
      const tickets = await Ticket.find(filter).sort({ updatedAt: -1 });

      return tickets;
    } catch (error) {
      logger.error(`Error fetching my tickets: ${error.message}`);
      throw error;
    }
  },

  getAllTickets: async () => {
    try {
      const tickets = await Ticket.find({}).sort({ updatedAt: -1 });

      return tickets;
    } catch (error) {
      logger.error(`Error fetching all tickets: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { ticketService };
