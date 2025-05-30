const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SiteStatusSchema = new Schema({
  status: {
    type: String,
    enum: ["OPERATIONAL", "MAINTENANCE", "BUG", "SERVER_ISSUE", "DOWN"],
    required: true,
    default: "OPERATIONAL",
  },
  message: {
    type: String,
    trim: true,
    default: "",
  },
  expectedResolutionTime: {
    type: Date,
    default: null,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
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

SiteStatusSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

SiteStatusSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model("SiteStatus", SiteStatusSchema);
