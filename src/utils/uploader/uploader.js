const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../logger/logger");

const uploadDir = path.join(__dirname, "../../uploads");
const imageDir = path.join(uploadDir, "images/user");
const audioDir = path.join(uploadDir, "audios");
const videoDir = path.join(uploadDir, "videos");
const otherDir = path.join(uploadDir, "other");

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
const maxFileSize = 5 * 1024 * 1024; // 5MB

const initDirectories = async () => {
  try {
    await fs.mkdir(uploadDir, { recursive: true });
    await fs.mkdir(imageDir, { recursive: true });
    await fs.mkdir(audioDir, { recursive: true });
    await fs.mkdir(videoDir, { recursive: true });
    await fs.mkdir(otherDir, { recursive: true });
    logger.info("Upload directories initialized successfully");
  } catch (error) {
    logger.error(`Error initializing directories: ${error.message}`);
    throw error;
  }
};

const getFileCategoryDir = (mimeType) => {
  if (allowedImageTypes.includes(mimeType)) {
    return imageDir;
  } else if (mimeType.startsWith("audio/")) {
    return audioDir;
  } else if (mimeType.startsWith("video/")) {
    return videoDir;
  }
  return otherDir;
};

const generateFileName = (user, fileExtension) => {
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  return `user-${user.username}-${user._id}-${date}.${fileExtension}`;
};

const fileUploader = {
  uploadProfileImage: async (file, user) => {
    try {
      await initDirectories();

      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new Error("Only JPEG, PNG, and GIF images are allowed");
      }

      if (file.size > maxFileSize) {
        throw new Error("File size exceeds 5MB limit");
      }

      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(user, fileExtension);
      const filePath = path.join(imageDir, fileName);

      await fs.writeFile(filePath, await file.toBuffer());
      logger.info(`Profile image uploaded for user ${user.email}: ${fileName}`);

      return `/Uploads/images/user/${fileName}`;
    } catch (error) {
      logger.error(`Error uploading profile image: ${error.message}`);
      throw error;
    }
  },
};

module.exports = fileUploader;
