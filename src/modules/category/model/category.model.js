const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CategorySchema = new Schema({
  name: {
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
  parentId: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    default: null,
  },
  description: {
    type: String,
    trim: true,
    default: "",
  },
  image: {
    type: String,
    trim: true,
    default: "",
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

CategorySchema.pre("save", async function (next) {
  this.updatedAt = Date.now();
  if (!this.name) {
    return next(new Error("نام دسته‌بندی برای تولید اسلاگ الزامی است"));
  }
  if (!this.slug) {
    let slug = this.name
      .replace(/\s+/g, "-") 
      .replace(/[^\u0600-\u06FFa-z0-9-]+/g, "") 
      .replace(/(^-|-$)/g, "")
      .substring(0, 50); 
    if (!slug) {
      return next(new Error("تولید اسلاگ معتبر از نام امکان‌پذیر نیست"));
    }
    this.slug = slug;
  }
  if (!this.metaTitle) {
    this.metaTitle = this.name.substring(0, 70);
  }
  if (!this.metaDescription && this.description) {
    this.metaDescription = this.description.substring(0, 160);
  }

  // جلوگیری از حلقه در سلسله‌مراتب
  if (this.parentId) {
    const parents = new Set();
    let current = await mongoose.model("Category").findById(this.parentId);
    while (current && current.parentId) {
      if (parents.has(current._id.toString())) {
        return next(
          new Error("ارجاع حلقوی در سلسله‌مراتب دسته‌بندی تشخیص داده شد")
        );
      }
      parents.add(current._id.toString());
      current = await mongoose.model("Category").findById(current.parentId);
    }
  }

  next();
});

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });

module.exports = mongoose.model("Category", CategorySchema);
