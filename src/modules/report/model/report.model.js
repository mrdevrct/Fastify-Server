const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  reporter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // کاربر گزارش‌دهنده
  reportedUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  }, // کاربر گزارش‌شده
  reason: { type: String, required: true }, // دلیل ریپورت
  createdAt: { type: Date, default: Date.now },
});

// جلوگیری از ریپورت‌های مکرر توسط یک کاربر علیه کاربر دیگر
reportSchema.index({ reporter: 1, reportedUser: 1 }, { unique: true });

const Report = mongoose.model("Report", reportSchema);

module.exports = Report;
