const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema برای رسانه‌ها
const MediaSchema = new Schema({
  type: {
    type: String,
    enum: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"],
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
const CommentSchema = new Schema({
  isAuthor: {
    type: Boolean,
    default: false,
  },
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  authorName: {
    type: String,
    required: true,
  },
  commentText: {
    type: String,
    required: true,
  },
  isRead: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  replyTo: {
    type: Schema.Types.ObjectId,
    ref: "Comment",
    default: null,
  },
});

// Schema اصلی مقاله
const ArticleSchema = new Schema({
  title: {
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
  content: {
    type: String,
    required: true,
  },
  coverImage: {
    type: MediaSchema,
    required: true,
  },
  media: [MediaSchema],
  authorId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  authorName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  category: {
    type: String,
    enum: ["TECHNOLOGY", "SCIENCE", "LIFESTYLE", "EDUCATION", "OTHER"],
    default: "OTHER",
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
    enum: ["DRAFT", "PUBLISHED", "ARCHIVED"],
    default: "DRAFT",
  },
  priority: {
    type: String,
    enum: ["LOW", "MEDIUM", "HIGH"],
    default: "LOW",
  },
  comments: [CommentSchema],
  views: {
    type: Number,
    default: 0,
  },
  likes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],
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
ArticleSchema.pre("save", function (next) {
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
  if (!this.metaDescription && this.content) {
    this.metaDescription = this.content
      .replace(/<[^>]+>/g, "")
      .substring(0, 160);
  }

  if (this.status === "PUBLISHED" && !this.publishedAt) {
    this.publishedAt = Date.now();
  }

  next();
});

// اعتبارسنجی برای تگ‌ها و کلمات کلیدی
ArticleSchema.path("tags").validate(function (tags) {
  return tags.length <= 10;
}, "Maximum 10 tags are allowed.");
ArticleSchema.path("keywords").validate(function (keywords) {
  return keywords.length <= 10;
}, "Maximum 10 keywords are allowed.");

// ایندکس‌ها
ArticleSchema.index({
  title: "text",
  metaTitle: "text",
  metaDescription: "text",
}); // ایندکس متنی برای جستجوی متنی
ArticleSchema.index({ slug: 1 }); // ایندکس برای دسترسی سریع به slug
ArticleSchema.index({ tags: 1 }); // ایندکس برای فیلتر بر اساس تگ‌ها
ArticleSchema.index({ keywords: 1 }); // ایندکس برای فیلتر بر اساس کلمات کلیدی
ArticleSchema.index({ authorId: 1, createdAt: -1 }); // کوئری نویسنده
ArticleSchema.index({ status: 1, publishedAt: -1 }); // فیلتر مقالات منتشرشده

// متد برای افزایش بازدید
ArticleSchema.methods.incrementViews = async function () {
  this.views += 1;
  return this.save();
};

module.exports = mongoose.model("Article", ArticleSchema);
