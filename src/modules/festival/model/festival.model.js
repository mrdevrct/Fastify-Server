const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema برای رسانه‌ها (تصویر تبلیغاتی جشنواره)
const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ["IMAGE"],
    required: true,
  },
  url: {
    type: String,
    required: true,
    trim: true,
  },
  mimeType: {
    type: String,
    required: false,
  },
  size: {
    type: Number,
    default: null,
  },
  caption: {
    type: String,
    trim: true,
    default: "",
  },
  altText: {
    type: String,
    trim: true,
    default: "",
  },
  uploadedBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

// Schema اصلی جشنواره
const FestivalSchema = new Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },
  slug: {
    type: String,
    unique: true,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
  },
  bannerImage: {
    type: MediaSchema,
    required: true,
  },
  discountPercentage: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  products: [
    {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
  ],
  category: {
    type: String,
    enum: ["ELECTRONICS", "FASHION", "HOME", "SPORTS", "BOOKS", "OTHER", "ALL"],
    default: "ALL",
  },
  status: {
    type: String,
    enum: ["ACTIVE", "INACTIVE", "EXPIRED"],
    default: "INACTIVE",
  },
  metaTitle: {
    type: String,
    trim: true,
    maxlength: 70,
  },
  metaDescription: {
    type: String,
    trim: true,
    maxlength: 160,
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

// Middleware برای به‌روزرسانی و سئو
FestivalSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  if (!this.metaTitle) {
    this.metaTitle = this.title.substring(0, 70);
  }
  if (!this.metaDescription && this.description) {
    this.metaDescription = this.description
      .replace(/<[^>]+>/g, "")
      .substring(0, 160);
  }

  // تنظیم وضعیت بر اساس تاریخ
  const now = new Date();
  if (this.startDate <= now && this.endDate >= now) {
    this.status = "ACTIVE";
  } else if (this.endDate < now) {
    this.status = "EXPIRED";
  } else {
    this.status = "INACTIVE";
  }

  next();
});

// ایندکس‌ها
FestivalSchema.index({
  title: "text",
  metaTitle: "text",
  metaDescription: "text",
});
FestivalSchema.index({ slug: 1 });
FestivalSchema.index({ category: 1, startDate: -1, endDate: -1 });
FestivalSchema.index({ status: 1 });

module.exports = mongoose.model("Festival", FestivalSchema);
