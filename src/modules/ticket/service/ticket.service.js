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

  getMyTickets: async (user, page = 1, perPage = 20) => {
    try {
      const filter = {
        $or: [{ userId: user.id }, { email: user.email }],
      };

      const skip = (page - 1) * perPage;

      const [tickets, total] = await Promise.all([
        Ticket.find(filter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean()
          .exec(),
        Ticket.countDocuments(filter),
      ]);

      const formattedTickets = tickets.map((ticket) => ({
        id: ticket._id,
        title: ticket.title,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        email: ticket.email,
        username: ticket.username,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      }));

      return { tickets: formattedTickets, total };
    } catch (error) {
      logger.error(`Error fetching my tickets: ${error.message}`);
      throw error;
    }
  },

  getAllTickets: async (page = 1, perPage = 20) => {
    try {
      const skip = (page - 1) * perPage;

      const [tickets, total] = await Promise.all([
        Ticket.find({})
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean()
          .exec(),
        Ticket.countDocuments({}),
      ]);

      const formattedTickets = tickets.map((ticket) => ({
        id: ticket._id,
        title: ticket.title,
        priority: ticket.priority,
        category: ticket.category,
        userId: ticket.userId,
        email: ticket.email,
        username: ticket.username,
        status: ticket.status,
        createdAt: ticket.createdAt,
        updatedAt: ticket.updatedAt,
      }));

      return { tickets: formattedTickets, total };
    } catch (error) {
      logger.error(`Error fetching all tickets: ${error.message}`);
      throw error;
    }
  },

  getTicketMessages: async (ticketId, user) => {
    try {
      const ticket = await Ticket.findById(ticketId).lean().exec();
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const isOwner =
        ticket.userId?.toString() === user.id || ticket.email === user.email;

      const hasAccess =
        user?.featureAccess?.some((f) => f.feature === "TICKETS:LIST") ||
        user.userType === "ADMIN";

      if (!isOwner && !hasAccess) {
        throw new Error("You do not have permission to view this ticket");
      }

      return ticket.messages || [];
    } catch (error) {
      logger.error(`Error getting ticket messages: ${error.message}`);
      throw error;
    }
  },

  updateTicket: async (ticketId, updateFields, user) => {
    try {
      const allowedAdmins = ["ADMIN", "SUPER_ADMIN"];

      if (!allowedAdmins.includes(user.adminStatus)) {
        throw new Error("You are not authorized to update tickets");
      }

      const hasFullAccess = user.featureAccess?.some(
        (f) => f.feature === "EDIT_TICKET" && f.access === "FULL_ACCESS"
      );

      if (!hasFullAccess) {
        throw new Error("You do not have access to edit tickets");
      }

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) throw new Error("Ticket not found");

      if (updateFields.title) ticket.title = updateFields.title;
      if (updateFields.category) ticket.category = updateFields.category;
      if (updateFields.status) ticket.status = updateFields.status;
      if (updateFields.priority) ticket.priority = updateFields.priority;

      ticket.updatedAt = new Date();
      await ticket.save();

      return ticket;
    } catch (error) {
      logger.error(`Error updating ticket: ${error.message}`);
      throw error;
    }
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
        replyTo: messageData.replyTo || null,
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

  replyToTicket: async (ticketId, messageText, user, replyTo = null) => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) throw new Error("Ticket not found");

      ticket.messages.forEach((msg) => {
        if (msg.isSender !== (user.userType === "USER") && !msg.isRead) {
          msg.isRead = true;
        }
      });

      const newMessage = {
        isSender: user.userType === "USER",
        senderName: user.username || user.email,
        messageText,
        files: [],
        isRead: false,
        createdAt: new Date(),
        replyTo: replyTo || null,
      };

      ticket.messages.push(newMessage);
      ticket.updatedAt = new Date();
      await ticket.save();

      return ticket;
    } catch (error) {
      logger.error(`Error in replyToTicket: ${error.message}`);
      throw error;
    }
  },

  deleteTicket: async (ticketId, user) => {
    try {
      const allowedAdmins = ["ADMIN", "SUPER_ADMIN"];

      if (!allowedAdmins.includes(user.adminStatus)) {
        throw new Error("You are not authorized to delete tickets");
      }

      const hasFullAccess = user.featureAccess?.some(
        (f) => f.feature === "EDIT_TICKET" && f.access === "FULL_ACCESS"
      );

      if (!hasFullAccess) {
        throw new Error("You do not have access to delete tickets");
      }

      const ticket = await Ticket.findById(ticketId);
      if (!ticket) throw new Error("Ticket not found");

      await ticket.remove();
      return ticket;
    } catch (error) {
      logger.error(`Error deleting ticket: ${error.message}`);
      throw error;
    }
  },

  markMessagesAsRead: async (ticketId, user) => {
    try {
      const ticket = await Ticket.findById(ticketId);
      if (!ticket) {
        throw new Error("Ticket not found");
      }

      const isOwner =
        ticket.userId?.toString() === user.id || ticket.email === user.email;

      const hasAccess =
        user?.featureAccess?.some((f) => f.feature === "ALL_TICKETS") ||
        user.userType === "ADMIN";

      if (!isOwner && !hasAccess) {
        throw new Error("You do not have permission to update this ticket");
      }

      let updated = false;

      ticket.messages.forEach((msg) => {
        if (msg.isSender !== (user.userType === "USER") && !msg.isRead) {
          msg.isRead = true;
          updated = true;
        }
      });

      if (updated) {
        ticket.updatedAt = new Date();
        await ticket.save();
      }

      return true;
    } catch (error) {
      logger.error(`Error marking messages as read: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { ticketService };
