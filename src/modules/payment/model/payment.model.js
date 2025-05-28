const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema اصلی پرداخت
const PaymentSchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  currency: {
    type: String,
    default: "IRR",
  },
  status: {
    type: String,
    enum: ["PENDING", "SUCCESS", "FAILED", "REFUNDED"],
    default: "PENDING",
  },
  paymentMethod: {
    type: String,
    enum: ["CARD", "WALLET", "CASH_ON_DELIVERY"],
    required: true,
  },
  transactionId: {
    type: String,
    unique: true,
    sparse: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// ایندکس‌ها
PaymentSchema.index({ orderId: 1 });
PaymentSchema.index({ userId: 1, createdAt: -1 });
PaymentSchema.index({ transactionId: 1 });

// جلوگیری از تعریف چندباره مدل
module.exports =
  mongoose.models.Payment || mongoose.model("Payment", PaymentSchema);
