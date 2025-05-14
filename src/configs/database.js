const mongoose = require("mongoose");
const { config } = require("./env");
const { logger } = require("../utils/logger/logger");

const connectDB = async () => {
  try {
    await mongoose.connect(config.mongodbUri);
    logger.info("MongoDB connected");
  } catch (error) {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  }
};

module.exports = { connectDB };
