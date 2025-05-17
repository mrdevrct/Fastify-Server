const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const OrderStatusHistorySchema = new Schema({
  orderId: {
    type: Schema.Types.ObjectId,
    ref: "Order",
    required: true,
    index: true,
  },
  status: {
    type: String,
    enum: [
      "PENDING", // در انتظار تأیید
      "PREPARING", // در حال آماده‌سازی
      "SHIPPED_FROM_WAREHOUSE", // ارسال‌شده از انبار
      "IN_TRANSIT", // در حال ارسال
      "DELIVERED", // تحویل‌شده
      "CANCELLED", // لغوشده
    ],
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null, // برای به‌روزرسانی‌های سیستمی یا کاربر ناشناس
  },
  notes: {
    type: String,
    default: "",
    maxlength: 500,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

OrderStatusHistorySchema.index({ orderId: 1, createdAt: -1 });

module.exports =
  mongoose.models.OrderStatusHistory ||
  mongoose.model("OrderStatusHistory", OrderStatusHistorySchema);
