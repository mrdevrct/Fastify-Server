const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../logger/logger");

const uploadRoot = path.join(__dirname, "../../Uploads");
const userRoot = path.join(uploadRoot, "user");
const userImageDir = path.join(userRoot, "images");
const ticketRoot = path.join(uploadRoot, "ticket");
const ticketImageDir = path.join(ticketRoot, "images");
const ticketVideoDir = path.join(ticketRoot, "videos");
const ticketAudioDir = path.join(ticketRoot, "audios");
const ticketOtherDir = path.join(ticketRoot, "others");

const allowedImageTypes = ["image/jpeg", "image/png", "image/gif"];
const allowedAudioTypes = ["audio/mpeg", "audio/wav"];
const allowedVideoTypes = ["video/mp4", "video/mpeg"];
const allowedTicketFileTypes = [
  ...allowedImageTypes,
  ...allowedAudioTypes,
  ...allowedVideoTypes,
  "application/pdf",
  "text/plain",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const maxFileSize = 20 * 1024 * 1024; // 20MB

const initDirectories = async () => {
  try {
    // Create root directories
    await fs.mkdir(uploadRoot, { recursive: true });
    await fs.mkdir(userRoot, { recursive: true });
    await fs.mkdir(ticketRoot, { recursive: true });

    // Create subdirectories
    await fs.mkdir(userImageDir, { recursive: true });
    await fs.mkdir(ticketImageDir, { recursive: true });
    await fs.mkdir(ticketVideoDir, { recursive: true });
    await fs.mkdir(ticketAudioDir, { recursive: true });
    await fs.mkdir(ticketOtherDir, { recursive: true });

    return {
      userImageDir,
      ticketImageDir,
      ticketVideoDir,
      ticketAudioDir,
      ticketOtherDir,
    };
  } catch (error) {
    logger.error(`Error initializing directories: ${error.message}`);
    throw error;
  }
};

const generateFileName = (prefix, username, refId, fileExtension) => {
  const now = new Date();
  const pad = (n) => n.toString().padStart(2, "0");
  const dateTimeString = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  return `${prefix}-${username}-${refId}-${dateTimeString}.${fileExtension}`;
};

const getTicketFileDir = (mimetype) => {
  if (allowedImageTypes.includes(mimetype)) {
    return { dir: ticketImageDir, subPath: "images" };
  } else if (allowedAudioTypes.includes(mimetype)) {
    return { dir: ticketAudioDir, subPath: "audios" };
  } else if (allowedVideoTypes.includes(mimetype)) {
    return { dir: ticketVideoDir, subPath: "videos" };
  } else {
    return { dir: ticketOtherDir, subPath: "others" };
  }
};

const fileUploader = {
  uploadProfileImage: async (file, user) => {
    try {
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new Error("Only JPEG, PNG, and GIF images are allowed");
      }

      if (!file.size || file.size > maxFileSize) {
        throw new Error(
          file.size
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "user",
        user.username,
        user._id,
        fileExtension
      );
      const fullPath = path.join(userImageDir, fileName);

      await fs.writeFile(fullPath, file.fileBuffer);
      logger.info(`✅ Profile image uploaded for ${user.email} => ${fileName}`);

      return `/uploads/user/images/${fileName}`;
    } catch (error) {
      logger.error(`❌ Error uploading profile image: ${error.message}`);
      throw error;
    }
  },

  uploadTicketFile: async (file, user, ticketId) => {
    try {
      if (!allowedTicketFileTypes.includes(file.mimetype)) {
        throw new Error("Unsupported file type");
      }

      if (!file.size || file.size > maxFileSize) {
        throw new Error(
          file.size
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const { dir: targetDir, subPath } = getTicketFileDir(file.mimetype);
      const fileExtension =
        file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
      const fileName = generateFileName(
        "ticket",
        user.username,
        ticketId,
        fileExtension
      );
      const fullPath = path.join(targetDir, fileName);

      await fs.writeFile(fullPath, file.fileBuffer);
      logger.info(`✅ Ticket file uploaded for ${user.email} => ${fileName}`);

      return {
        name: file.filename,
        size: file.size,
        format: file.mimetype,
        path: `/uploads/ticket/${subPath}/${fileName}`,
      };
    } catch (error) {
      logger.error(`❌ Error uploading ticket file: ${error.message}`);
      throw error;
    }
  },

  uploadTicketFiles: async (files, user, ticketId) => {
    try {
      if (files.length > 3) {
        throw new Error("Maximum 3 files can be uploaded");
      }

      const uploadedFiles = [];
      for (const file of files) {
        const uploadedFile = await fileUploader.uploadTicketFile(
          file,
          user,
          ticketId
        );
        uploadedFiles.push(uploadedFile);
      }

      return uploadedFiles;
    } catch (error) {
      logger.error(`❌ Error uploading ticket files: ${error.message}`);
      throw error;
    }
  },
};

module.exports = fileUploader;
