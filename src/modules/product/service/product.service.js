const Product = require("../model/product.model");
const { logger } = require("../../../utils/logger/logger");

const productService = {
  createProduct: async (productData, user) => {
    try {
      const newProduct = new Product({
        name: productData.name,
        slug: productData.slug,
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
        category: productData.category || "OTHER",
        brand: productData.brand || "",
        tags: productData.tags || [],
        keywords: productData.keywords || [],
        metaTitle: productData.metaTitle,
        metaDescription: productData.metaDescription,
        status: productData.status || "DRAFT",
      });

      await newProduct.save();
      return newProduct;
    } catch (error) {
      logger.error(`Error creating product: ${error.message}`);
      throw error;
    }
  },

  getMyProducts: async (user) => {
    try {
      const products = await Product.find({}).sort({ updatedAt: -1 }); // برای ساده‌سازی، همه محصولات برگردانده می‌شوند
      return products;
    } catch (error) {
      logger.error(`Error fetching my products: ${error.message}`);
      throw error;
    }
  },

  getAllProducts: async () => {
    try {
      const products = await Product.find({}).sort({ updatedAt: -1 });
      return products;
    } catch (error) {
      logger.error(`Error fetching all products: ${error.message}`);
      throw error;
    }
  },

  getProduct: async (identifier, user) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { slug: identifier };

      const product = await Product.findOne(query);
      if (!product) {
        throw new Error("Product not found");
      }

      return product;
    } catch (error) {
      logger.error(`Error fetching product: ${error.message}`);
      throw error;
    }
  },

  updateProduct: async (productId, updateData, user) => {
    try {
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");

      if (updateData.name) product.name = updateData.name;
      if (updateData.slug) product.slug = updateData.slug;
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
      if (updateData.category) product.category = updateData.category;
      if (updateData.brand) product.brand = updateData.brand;
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
};

module.exports = { productService };
