const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema برای آیتم‌های سبد خرید
const CartItemSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
  },
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
});

// Schema اصلی سبد خرید
const CartSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  items: [CartItemSchema],
  totalPrice: {
    type: Number,
    required: true,
    default: 0,
  },
  totalDiscountPrice: {
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
});

// Middleware برای محاسبه قیمت‌ها
CartSchema.pre("save", function (next) {
  this.updatedAt = Date.now();

  // محاسبه totalPrice و totalDiscountPrice
  this.totalPrice = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  this.totalDiscountPrice = this.items.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  next();
});

// ایندکس‌ها
CartSchema.index({ userId: 1 });

module.exports = mongoose.model("Cart", CartSchema);
