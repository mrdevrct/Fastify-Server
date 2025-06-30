const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const SeoSchema = new Schema({
  entityId: {
    type: Schema.Types.ObjectId,
    required: true,
    refPath: "entityType",
  },
  entityType: {
    type: String,
    enum: ["category", "product", "page"],
    required: true,
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
  canonicalUrl: {
    type: String,
    trim: true,
  },
  ogTitle: {
    type: String,
    trim: true,
    maxlength: 70,
  },
  ogDescription: {
    type: String,
    trim: true,
    maxlength: 160,
  },
  ogImage: {
    type: String,
    trim: true,
  },
  keywords: {
    type: [String],
    default: [],
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

SeoSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

SeoSchema.index({ entityId: 1, entityType: 1 }, { unique: true });

module.exports = mongoose.model("Seo", SeoSchema);
