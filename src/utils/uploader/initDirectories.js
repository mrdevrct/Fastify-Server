const fs = require("fs").promises;
const config = require("../../configs/uploaderConfig");
const { logger } = require("../logger/logger");

const initDirectories = async () => {
  try {
    await fs.mkdir(config.uploadRoot, { recursive: true });
    await fs.mkdir(config.userRoot, { recursive: true });
    await fs.mkdir(config.ticketRoot, { recursive: true });
    await fs.mkdir(config.articleRoot, { recursive: true });
    await fs.mkdir(config.productRoot, { recursive: true });
    await fs.mkdir(config.festivalRoot, { recursive: true });
    await fs.mkdir(config.categoryRoot, { recursive: true });

    await fs.mkdir(config.userImageDir, { recursive: true });
    await fs.mkdir(config.ticketImageDir, { recursive: true });
    await fs.mkdir(config.ticketVideoDir, { recursive: true });
    await fs.mkdir(config.ticketAudioDir, { recursive: true });
    await fs.mkdir(config.ticketOtherDir, { recursive: true });
    await fs.mkdir(config.articleImageDir, { recursive: true });
    await fs.mkdir(config.articleVideoDir, { recursive: true });
    await fs.mkdir(config.articleAudioDir, { recursive: true });
    await fs.mkdir(config.articleOtherDir, { recursive: true });
    await fs.mkdir(config.productImageDir, { recursive: true });
    await fs.mkdir(config.productVideoDir, { recursive: true });
    await fs.mkdir(config.productOtherDir, { recursive: true });
    await fs.mkdir(config.festivalImageDir, { recursive: true });
    await fs.mkdir(config.festivalOtherDir, { recursive: true });
    await fs.mkdir(config.categoryImageDir, { recursive: true });
    await fs.mkdir(config.categoryOtherDir, { recursive: true });

    logger.info("Upload directories initialized successfully");
    return config;
  } catch (error) {
    logger.error(`Error initializing directories: ${error.message}`);
    throw error;
  }
};

module.exports = initDirectories;
