const mongoose = require("mongoose");
const { seoService } = require("../../SEO/service/seo.service");
const Schema = mongoose.Schema;

function slugifyPersian(str) {
  return str
    .trim()
    .toLowerCase()
    .replace(/[\s]+/g, "-")
    .replace(/[^\w\u0600-\u06FF\u0660-\u0669\u06F0-\u06F9-]+/g, "");
}

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

  // تولید slug از نام فارسی
  if (!this.slug) {
    const baseSlug = slugifyPersian(this.name);

    if (!baseSlug) {
      return next(new Error("تولید اسلاگ معتبر از نام امکان‌پذیر نیست"));
    }

    let finalSlug = baseSlug;
    let counter = 1;

    while (
      await mongoose.model("Category").findOne({
        slug: finalSlug,
        _id: { $ne: this._id },
      })
    ) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = finalSlug;
  }

  // ذخیره یا به‌روزرسانی اطلاعات SEO
  const seoData = {
    name: this.name,
    description: this.description,
    image: this.image,
    slug: this.slug,
    metaTitle: this.metaTitle,
    metaDescription: this.metaDescription,
  };

  await seoService.updateSeo(this._id, "category", seoData);

  // بررسی ارجاع حلقوی در parentId
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

CategorySchema.pre("remove", async function (next) {
  // حذف اطلاعات SEO مرتبط
  await seoService.deleteSeo(this._id, "category");
  next();
});

CategorySchema.index({ slug: 1 });
CategorySchema.index({ parentId: 1 });

module.exports = mongoose.model("Category", CategorySchema);
