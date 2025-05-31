const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const slugify = require("slugify"); // اضافه کردن این خط

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
    const rawSlug = slugify(this.name, {
      lower: true,
      strict: true,
      locale: "fa", // برای نگه‌داشتن حروف فارسی
      remove: /[*+~.()'"!:@،؛؟]/g, // حذف کاراکترهای خاص فارسی و انگلیسی
    });

    if (!rawSlug) {
      return next(new Error("تولید اسلاگ معتبر از نام امکان‌پذیر نیست"));
    }

    this.slug = rawSlug;
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
