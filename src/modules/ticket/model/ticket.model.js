//ticket.model.js
const mongoose = require("mongoose");

const fileDTOSchema = new mongoose.Schema({
  name: { type: String, required: true },
  size: { type: Number, required: true },
  format: { type: String, required: true },
  path: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const messageSchema = new mongoose.Schema({
  isSender: { type: Boolean, required: true },
  senderName: { type: String, required: true },
  messageText: { type: String, default: "" },
  files: { type: [fileDTOSchema], default: [] },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  replyTo: { type: mongoose.Schema.Types.ObjectId, default: null },
});

const ticketSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    email: { type: String, required: false },
    username: { type: String, required: false },
    title: { type: String, required: true },
    status: { type: String, enum: ["OPEN", "CLOSED"], default: "OPEN" },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "LOW",
    },
    category: { type: String, required: true },
    messages: [messageSchema],
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

const Ticket = mongoose.model("Ticket", ticketSchema);

module.exports = Ticket;
