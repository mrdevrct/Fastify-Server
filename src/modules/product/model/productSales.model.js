const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ProductSalesSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
    unique: true,
  },
  salesCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
});

ProductSalesSchema.index({ productId: 1 });
ProductSalesSchema.index({ salesCount: -1 });

module.exports = mongoose.model("ProductSales", ProductSalesSchema);