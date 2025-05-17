const Cart = require("../model/cart.model");
const Product = require("../../product/model/product.model");
const Festival = require("../../festival/model/festival.model");
const { logger } = require("../../../utils/logger/logger");

const cartService = {
  addToCart: async (user, productId, quantity) => {
    try {
      let cart = await Cart.findOne({ userId: user.id });
      const product = await Product.findById(productId);
      if (!product) throw new Error("Product not found");
      if (product.stock < quantity) throw new Error("Insufficient stock");

      // بررسی تخفیف جشنواره
      let discountPrice = product.discountPrice || product.price;
      const now = new Date();
      const festival = await Festival.findOne({
        products: productId,
        status: "ACTIVE",
        startDate: { $lte: now },
        endDate: { $gte: now },
      });

      if (festival) {
        discountPrice = product.price * (1 - festival.discountPercentage / 100);
      }

      if (!cart) {
        cart = new Cart({
          userId: user.id,
          items: [],
          totalPrice: 0,
          totalDiscountPrice: 0,
        });
      }

      const existingItem = cart.items.find(
        (item) => item.productId.toString() === productId
      );
      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.price = product.price;
        existingItem.discountPrice = discountPrice;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: product.price,
          discountPrice,
        });
      }

      await cart.save();
      return cart;
    } catch (error) {
      logger.error(`Error adding to cart: ${error.message}`);
      throw error;
    }
  },

  getCart: async (user) => {
    try {
      const cart = await Cart.findOne({ userId: user.id }).populate(
        "items.productId"
      );
      return (
        cart || {
          userId: user.id,
          items: [],
          totalPrice: 0,
          totalDiscountPrice: 0,
        }
      );
    } catch (error) {
      logger.error(`Error fetching cart: ${error.message}`);
      throw error;
    }
  },

  removeFromCart: async (user, productId) => {
    try {
      const cart = await Cart.findOne({ userId: user.id });
      if (!cart) throw new Error("Cart not found");

      cart.items = cart.items.filter(
        (item) => item.productId.toString() !== productId
      );
      await cart.save();
      return cart;
    } catch (error) {
      logger.error(`Error removing from cart: ${error.message}`);
      throw error;
    }
  },

  clearCart: async (user) => {
    try {
      const cart = await Cart.findOne({ userId: user.id });
      if (cart) {
        cart.items = [];
        await cart.save();
      }
      return true;
    } catch (error) {
      logger.error(`Error clearing cart: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { cartService };
