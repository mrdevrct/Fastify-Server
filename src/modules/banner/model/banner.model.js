const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema(
  {
    imageSrc: { type: String, required: true },
    imageAlt: { type: String, required: true },
    title: { type: String, required: true },
    subtitle: { type: String, required: true },
    link: { type: String, required: true },
    isDiscount: { type: Boolean, default: false },
    expirationDate: { type: Date, required: true },
  },
  {
    timestamps: true,
  }
);

const Banner = mongoose.model("Banner", bannerSchema);

module.exports = Banner;
