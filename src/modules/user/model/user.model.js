const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const defaultFeatures = require("../../../configs/defaultFeatures");

const featureAccessSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  feature: { type: String, required: true },
  access: {
    type: String,
    enum: ["FULL_ACCESS", "READ_ONLY", "NO_ACCESS"],
    required: true,
  },
});

const userSchema = new mongoose.Schema(
  {
    username: { type: String, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    lastName: { type: String },
    firstName: { type: String },
    userType: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    adminStatus: {
      type: String,
      enum: ["USER_REGISTRED", "ADMIN", "NON_ADMIN", "PENDING", "SUPER_ADMIN"],
      default: "USER_REGISTRED",
    },
    featureAccess: [featureAccessSchema],
    profilePath: { type: String, default: "" },
    verificationCode: { type: String },
    verificationCodeExpires: { type: Date },
    resetPasswordCode: { type: String },
    resetPasswordExpires: { type: Date },
    reportCount: { type: Number, default: 0 },
    isBanned: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

// Hash the password before saving
userSchema.pre("save", async function (next) {
  if (this.isModified("password") && this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Set the first user as SUPER_ADMIN
userSchema.pre("save", async function (next) {
  if (this.isNew) {
    const userCount = await mongoose.model("User").countDocuments();
    if (userCount === 0) {
      this.userType = "ADMIN";
      this.adminStatus = "SUPER_ADMIN";
      this.featureAccess = defaultFeatures; // Default feature access for super admin
      this.username = "superadmin";
    }
  }
  next();
});

const User = mongoose.model("User", userSchema);

module.exports = User;
