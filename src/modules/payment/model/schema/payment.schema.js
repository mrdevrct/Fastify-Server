const paymentJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string", description: "Payment MongoDB ID" },
    orderId: { type: "string", description: "Associated order ID" },
    userId: { type: "string", description: "User ID who made the payment" },
    amount: { type: "number", description: "Payment amount" },
    paymentMethod: { type: "string", description: "Payment method used" },
    status: {
      type: "string",
      enum: ["PENDING", "SUCCESS", "FAILED"],
      description: "Payment status",
    },
    transactionId: {
      type: "string",
      nullable: true,
      description: "Transaction ID from payment gateway",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Payment creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Payment update timestamp",
    },
  },
  required: [
    "orderId",
    "userId",
    "amount",
    "paymentMethod",
    "status",
    "createdAt",
    "updatedAt",
  ],
};

module.exports = { paymentJsonSchema };
