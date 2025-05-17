const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema برای رسانه‌ها
const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ["IMAGE", "VIDEO", "DOCUMENT", "OTHER"],
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

// Schema برای نظرات
const ReviewSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  comment: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Schema اصلی محصول
const ProductSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200,
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
  mainImage: {
    type: MediaSchema,
    required: true,
  },
  media: [MediaSchema],
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  discountPrice: {
    type: Number,
    min: 0,
    default: null,
  },
  stock: {
    type: Number,
    required: true,
    min: 0,
    default: 0,
  },
  category: {
    type: String,
    enum: ["ELECTRONICS", "FASHION", "HOME", "SPORTS", "BOOKS", "OTHER"],
    default: "OTHER",
  },
  brand: {
    type: String,
    trim: true,
    default: "",
  },
  tags: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
  keywords: [
    {
      type: String,
      trim: true,
      lowercase: true,
    },
  ],
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
  status: {
    type: String,
    enum: ["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "DISCONTINUED"],
    default: "DRAFT",
  },
  reviews: [ReviewSchema],
  averageRating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0,
  },
  views: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  publishedAt: {
    type: Date,
    default: null,
  },
});

// Middleware برای به‌روزرسانی و سئو
ProductSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  if (!this.slug) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  if (!this.metaTitle) {
    this.metaTitle = this.name.substring(0, 70);
  }
  if (!this.metaDescription && this.description) {
    this.metaDescription = this.description
      .replace(/<[^>]+>/g, "")
      .substring(0, 160);
  }

  if (this.status === "PUBLISHED" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  // محاسبه میانگین امتیاز
  if (this.reviews.length > 0) {
    const totalRating = this.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    this.averageRating = totalRating / this.reviews.length;
  } else {
    this.averageRating = 0;
  }

  next();
});

// اعتبارسنجی برای تگ‌ها و کلمات کلیدی
ProductSchema.path("tags").validate(function (tags) {
  return tags.length <= 10;
}, "Maximum 10 tags are allowed.");
ProductSchema.path("keywords").validate(function (keywords) {
  return keywords.length <= 10;
}, "Maximum 10 keywords are allowed.");

// ایندکس‌ها
ProductSchema.index({
  name: "text",
  metaTitle: "text",
  metaDescription: "text",
}); // جستجوی متنی
ProductSchema.index({ slug: 1 }); // دسترسی سریع به slug
ProductSchema.index({ tags: 1 }); // فیلتر بر اساس تگ‌ها
ProductSchema.index({ keywords: 1 }); // فیلتر بر اساس کلمات کلیدی
ProductSchema.index({ category: 1, publishedAt: -1 }); // فیلتر محصولات منتشرشده
ProductSchema.index({ price: 1, discountPrice: 1 }); // مرتب‌سازی بر اساس قیمت

// متد برای افزایش بازدید
ProductSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("Product", ProductSchema);
