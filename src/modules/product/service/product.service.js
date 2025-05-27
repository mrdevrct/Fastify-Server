const mongoose = require("mongoose");
const Product = require("../model/product.model");
const Category = require("../../category/model/category.model");
const ProductSales = require("../model/productSales.model");
const { logger } = require("../../../utils/logger/logger");

const productService = {
  createProduct: async (productData, user) => {
    try {
      const newProduct = new Product({
        name: productData.name,
        description: productData.description,
        mainImage: {
          ...productData.mainImage,
          uploadedBy: user.id,
        },
        media: productData.media
          ? productData.media.map((m) => ({ ...m, uploadedBy: user.id }))
          : [],
        price: productData.price,
        discountPrice: productData.discountPrice || null,
        stock: productData.stock,
        categoryId: productData.categoryId,
        brand: productData.brand || "",
        attributes: productData.attributes || {},
        tags: productData.tags || [],
        keywords: productData.keywords || [],
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
        status: productData.status || "DRAFT",
      });

      await newProduct.save();

      // ایجاد سند فروش اولیه
      await ProductSales.create({ productId: newProduct._id, salesCount: 0 });

      return newProduct;
    } catch (error) {
      logger.error(`Error creating product: ${error.message}`);
      throw error;
    }
  },

  getProducts: async (filters = {}, sort = {}, page = 1, perPage = 20) => {
    try {
      const query = { status: "PUBLISHED" };

      // فیلترها
      if (filters.categorySlug) {
        const category = await Category.findOne({ slug: filters.categorySlug });
        if (!category) throw new Error("Category not found");

        // یافتن تمام زیرمجموعه‌ها
        const subCategories = await getAllSubCategories(category._id);
        query.categoryId = { $in: [category._id, ...subCategories] };
      }
      if (filters.brand) {
        query.brand = { $in: filters.brand.split(",") };
      }
      if (filters.minPrice || filters.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = parseFloat(filters.minPrice);
        if (filters.maxPrice) query.price.$lte = parseFloat(filters.maxPrice);
      }
      if (filters.inStock === "true") {
        query.stock = { $gt: 0 };
      }
      if (filters.tags) {
        query.tags = { $in: filters.tags.split(",") };
      }
      if (filters.search) {
        query.$text = { $search: filters.search };
      }

      // مرتب‌سازی
      const sortOptions = {};
      if (sort.sortBy === "priceAsc") sortOptions.price = 1;
      if (sort.sortBy === "priceDesc") sortOptions.price = -1;
      if (sort.sortBy === "newest") sortOptions.createdAt = -1;
      if (sort.sortBy === "mostViewed") sortOptions.views = -1;
      if (sort.sortBy === "topRated") sortOptions.averageRating = -1;
      if (sort.sortBy === "mostDiscounted") sortOptions.discountPercentage = -1;

      // صفحه‌بندی
      const skip = (page - 1) * perPage;

      const [products, total] = await Promise.all([
        Product.find(query)
          .sort(sortOptions)
          .skip(skip)
          .limit(perPage)
          .populate("categoryId")
          .lean()
          .exec(),
        Product.countDocuments(query),
      ]);

      // فرمت کردن محصولات برای پاسخ
      const formattedProducts = products.map((product) => ({
        id: product._id,
        name: product.name,
        slug: product.slug,
        description: product.description,
        mainImage: product.mainImage,
        media: product.media,
        price: product.price,
        discountPrice: product.discountPrice,
        stock: product.stock,
        categoryId: product.categoryId,
        brand: product.brand,
        attributes: product.attributes,
        tags: product.tags,
        keywords: product.keywords,
        metaTitle: product.metaTitle,
        metaDescription: product.metaDescription,
        status: product.status,
        views: product.views,
        averageRating: product.averageRating,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));

      return { products: formattedProducts, total };
    } catch (error) {
      logger.error(`Error fetching products: ${error.message}`);
      throw error;
    }
  },

  getNewProducts: async (limit = 10) => {
    try {
      return await Product.find({ status: "PUBLISHED" })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("categoryId")
        .lean()
        .exec();
    } catch (error) {
      logger.error(`Error fetching new products: ${error.message}`);
      throw error;
    }
  },

  getPopularProducts: async (limit = 10, categorySlug = null) => {
    try {
      const query = { status: "PUBLISHED" };
      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) throw new Error("Category not found");
        const subCategories = await getAllSubCategories(category._id);
        query.categoryId = { $in: [category._id, ...subCategories] };
      }

      return await Product.find(query)
        .sort({ views: -1, averageRating: -1 })
        .limit(limit)
        .populate("categoryId")
        .lean()
        .exec();
    } catch (error) {
      logger.error(`Error fetching popular products: ${error.message}`);
      throw error;
    }
  },

  getTopSellingProducts: async (limit = 10, categorySlug = null) => {
    try {
      const query = {};
      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) throw new Error("Category not found");
        const subCategories = await getAllSubCategories(category._id);
        query.categoryId = { $in: [category._id, ...subCategories] };
      }

      const topSelling = await ProductSales.find()
        .sort({ salesCount: -1 })
        .limit(limit)
        .populate({
          path: "productId",
          match: { status: "PUBLISHED", ...query },
          populate: { path: "categoryId" },
        })
        .lean()
        .exec();

      return topSelling
        .map((sale) => sale.productId)
        .filter((product) => product !== null);
    } catch (error) {
      logger.error(`Error fetching top-selling products: ${error.message}`);
      throw error;
    }
  },

  getMostDiscountedProducts: async (limit = 10, categorySlug = null) => {
    try {
      const query = { status: "PUBLISHED", discountPercentage: { $gt: 0 } };
      if (categorySlug) {
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) throw new Error("Category not found");
        const subCategories = await getAllSubCategories(category._id);
        query.categoryId = { $in: [category._id, ...subCategories] };
      }

      return await Product.find(query)
        .sort({ discountPercentage: -1 })
        .limit(limit)
        .populate("categoryId")
        .lean()
        .exec();
    } catch (error) {
      logger.error(`Error fetching most discounted products: ${error.message}`);
      throw error;
    }
  },

  getProduct: async (identifier, user) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { slug: identifier };

      const product = await Product.findOne(query)
        .populate("categoryId")
        .lean()
        .exec();
      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      logger.error(`Error fetching product: ${error.message}`);
      throw error;
    }
  },

  getSimilarProducts: async (productId, limit = 4) => {
    try {
      const product = await Product.findById(productId).lean();
      if (!product) {
        throw new Error("Product not found");
      }

      const query = {
        status: "PUBLISHED",
        _id: { $ne: productId }, // محصول خودش رو حذف کن
        $or: [
          { categoryId: product.categoryId }, // محصولات با دسته‌بندی یکسان
          { tags: { $in: product.tags } }, // محصولات با تگ‌های مشابه
        ],
      };

      return await Product.find(query)
        .sort({ views: -1, averageRating: -1 })
        .limit(limit)
        .populate("categoryId")
        .lean()
        .exec();
    } catch (error) {
      logger.error(`Error fetching similar products: ${error.message}`);
      throw error;
    }
  },

  updateProduct: async (productId, updateData, user) => {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      if (updateData.name) product.name = updateData.name;
      if (updateData.description) product.description = updateData.description;
      if (updateData.mainImage)
        product.mainImage = { ...updateData.mainImage, uploadedBy: user.id };
      if (updateData.media) {
        product.media = updateData.media.map((m) => ({
          ...m,
          uploadedBy: user.id,
        }));
      }
      if (updateData.price) product.price = updateData.price;
      if (updateData.discountPrice !== undefined)
        product.discountPrice = updateData.discountPrice;
      if (updateData.stock !== undefined) product.stock = updateData.stock;
      if (updateData.categoryId) product.categoryId = updateData.categoryId;
      if (updateData.brand) product.brand = updateData.brand;
      if (updateData.attributes) product.attributes = updateData.attributes;
      if (updateData.tags) product.tags = updateData.tags;
      if (updateData.keywords) product.keywords = updateData.keywords;
      if (updateData.metaTitle) product.metaTitle = updateData.metaTitle;
      if (updateData.metaDescription)
        product.metaDescription = updateData.metaDescription;
      if (updateData.status) product.status = updateData.status;

      product.updatedAt = new Date();
      await product.save();

      return product;
    } catch (error) {
      logger.error(`Error updating product: ${error.message}`);
      throw error;
    }
  },

  deleteProduct: async (productId, user) => {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      await ProductSales.deleteOne({ productId });
      await product.remove();
      return true;
    } catch (error) {
      logger.error(`Error deleting product: ${error.message}`);
      throw error;
    }
  },

  addReview: async (productId, reviewData, user) => {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      const newReview = {
        userId: user.id,
        username: user.username || user.email,
        rating: reviewData.rating,
        comment: reviewData.comment || "",
        createdAt: new Date(),
      };

      product.reviews.push(newReview);
      product.updatedAt = new Date();
      await product.save();

      return product;
    } catch (error) {
      logger.error(`Error adding review: ${error.message}`);
      throw error;
    }
  },

  updateSalesCount: async (order) => {
    try {
      for (const item of order.items) {
        await ProductSales.findOneAndUpdate(
          { productId: item.productId },
          { $inc: { salesCount: item.quantity }, lastUpdated: new Date() },
          { upsert: true }
        );
      }
    } catch (error) {
      logger.error(`Error updating sales count: ${error.message}`);
      throw error;
    }
  },
};

// تابع کمکی برای یافتن زیرمجموعه‌ها
async function getAllSubCategories(categoryId) {
  const subCategories = [];
  const queue = [categoryId];

  while (queue.length > 0) {
    const currentId = queue.shift();
    const children = await Category.find({ parentId: currentId })
      .select("_id")
      .lean()
      .exec();
    for (const child of children) {
      subCategories.push(child._id);
      queue.push(child._id);
    }
  }

  return subCategories;
}

module.exports = { productService };
