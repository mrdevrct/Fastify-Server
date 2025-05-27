const mongoose = require("mongoose");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
  adminId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  notificationJson: {
    id: {
      type: String,
      required: true,
      unique: true,
      default: () => new mongoose.Types.ObjectId().toString(),
    },
    status: {
      type: String,
      enum: ["PENDING", "SENT", "FAILED"],
      default: "PENDING",
    },
    message: {
      type: String,
      trim: true,
      default: "",
    },
    payloadJson: {
      commandTypeEnum: {
        type: String,
        enum: Object.values(NOTIFICATION_TYPES),
        required: true,
      },
      data: {
        type: Schema.Types.Mixed,
        default: {},
      },
    },
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

NotificationSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model("Notification", NotificationSchema);
