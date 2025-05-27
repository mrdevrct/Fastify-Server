const fs = require("fs").promises;
const path = require("path");
const { logger } = require("../logger/logger");
const config = require("../../configs/uploaderConfig");
const initDirectories = require("./initDirectories");
const {
  generateFileName,
  getTicketFileDir,
  getArticleFileDir,
  getProductFileDir,
  getFestivalFileDir,
  getCategoryFileDir,
} = require("./fileUtils");

const fileUploader = {
  uploadProfileImage: async (file, user) => {
    try {
      if (!config.allowedImageTypes.includes(file.mimetype)) {
        throw new Error("Only JPEG, PNG, and GIF images are allowed");
      }

      const fileSize = file.file?.bytesRead || (file.size ?? 0);
      if (!fileSize || fileSize > config.maxFileSize) {
        throw new Error(
          fileSize
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "user",
        user.username,
        user.id,
        fileExtension
      );

      let fileBuffer;
      if (file.toBuffer) {
        fileBuffer = await file.toBuffer();
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.fileBuffer) {
        fileBuffer = file.fileBuffer;
      } else {
        throw new Error("File buffer is missing!");
      }

      const fullPath = path.join(config.userImageDir, fileName);

      await fs.writeFile(fullPath, fileBuffer);
      logger.info(`✅ Profile image uploaded for ${user.email} => ${fileName}`);

      return `/uploads/user/images/${fileName}`;
    } catch (error) {
      logger.error(`❌ Error uploading profile image: ${error.message}`);
      throw error;
    }
  },

  uploadTicketFile: async (file, user, ticketId) => {
    try {
      if (!config.allowedTicketFileTypes.includes(file.mimetype)) {
        throw new Error("Unsupported file type");
      }

      const fileSize = file.size || file.file?.bytesRead || 0;
      if (!fileSize || fileSize > config.maxFileSize) {
        throw new Error(
          fileSize
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const { dir: targetDir, subPath } = getTicketFileDir(
        file.mimetype,
        config
      );
      const fileExtension =
        file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
      const fileName = generateFileName(
        "ticket",
        user.username,
        ticketId,
        fileExtension
      );
      const fullPath = path.join(targetDir, fileName);

      let fileBuffer;
      if (file.toBuffer) {
        fileBuffer = await file.toBuffer();
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.fileBuffer) {
        fileBuffer = file.fileBuffer;
      } else {
        throw new Error("File buffer is missing!");
      }

      await fs.writeFile(fullPath, fileBuffer);
      logger.info(`✅ Ticket file uploaded for ${user.email} => ${fileName}`);

      return {
        name: file.filename,
        size: fileSize,
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

  uploadArticleCoverImage: async (file, user) => {
    try {
      if (!config.allowedImageTypes.includes(file.mimetype)) {
        throw new Error(
          "Only JPEG, PNG, and GIF images are allowed for cover image"
        );
      }

      const fileSize = file.size || file.file?.bytesRead || 0;
      if (!fileSize || fileSize > config.maxFileSize) {
        throw new Error(
          fileSize
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "article-cover",
        user.username,
        user.id,
        fileExtension
      );
      const fullPath = path.join(config.articleImageDir, fileName);

      let fileBuffer;
      if (file.toBuffer) {
        fileBuffer = await file.toBuffer();
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.fileBuffer) {
        fileBuffer = file.fileBuffer;
      } else {
        throw new Error("File buffer is missing!");
      }

      await fs.writeFile(fullPath, fileBuffer);
      logger.info(
        `✅ Article cover image uploaded for ${user.email} => ${fileName}`
      );

      return {
        type: "IMAGE",
        url: `/uploads/article/images/${fileName}`,
        mimeType: file.mimetype,
        size: fileSize,
        caption: file.caption || "",
        altText: file.altText || "",
        uploadedBy: user.id,
      };
    } catch (error) {
      logger.error(`❌ Error uploading article cover image: ${error.message}`);
      throw error;
    }
  },

  uploadArticleMedia: async (files, user, articleId) => {
    try {
      if (files.length > 10) {
        throw new Error("Maximum 10 media files can be uploaded");
      }

      const uploadedFiles = [];
      for (const file of files) {
        if (!config.allowedArticleFileTypes.includes(file.mimetype)) {
          throw new Error("Unsupported file type");
        }

        const fileSize = file.size || file.file?.bytesRead || 0;
        if (!fileSize || fileSize > config.maxFileSize) {
          throw new Error(
            fileSize
              ? "File size exceeds 20MB limit"
              : "File size is required and cannot be zero"
          );
        }

        await initDirectories();
        const { dir: targetDir, subPath } = getArticleFileDir(
          file.mimetype,
          config
        );
        const fileExtension =
          file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
        const fileName = generateFileName(
          "article",
          user.username,
          articleId || user.id,
          fileExtension
        );
        const fullPath = path.join(targetDir, fileName);

        let fileBuffer;
        if (file.toBuffer) {
          fileBuffer = await file.toBuffer();
        } else if (file.buffer) {
          fileBuffer = file.buffer;
        } else if (file.fileBuffer) {
          fileBuffer = file.fileBuffer;
        } else {
          throw new Error("File buffer is missing!");
        }

        await fs.writeFile(fullPath, fileBuffer);
        logger.info(
          `✅ Article media uploaded for ${user.email} => ${fileName}`
        );

        uploadedFiles.push({
          type: config.allowedImageTypes.includes(file.mimetype)
            ? "IMAGE"
            : config.allowedVideoTypes.includes(file.mimetype)
            ? "VIDEO"
            : config.allowedAudioTypes.includes(file.mimetype)
            ? "AUDIO"
            : "OTHER",
          url: `/uploads/article/${subPath}/${fileName}`,
          mimeType: file.mimetype,
          size: fileSize,
          caption: file.caption || "",
          altText: file.altText || "",
          uploadedBy: user.id,
        });
      }

      return uploadedFiles;
    } catch (error) {
      logger.error(`❌ Error uploading article media: ${error.message}`);
      throw error;
    }
  },

  uploadProductMainImage: async (file, user) => {
    try {
      if (!config.allowedImageTypes.includes(file.mimetype)) {
        throw new Error(
          "Only JPEG, PNG, and GIF images are allowed for main image"
        );
      }
      const fileSize = file.size || file.file?.bytesRead || 0;
      if (!fileSize || fileSize > config.maxFileSize) {
        throw new Error(
          fileSize
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }
      await initDirectories();
      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "product-main",
        user.username,
        user.id,
        fileExtension
      );
      const fullPath = path.join(config.productImageDir, fileName);

      let fileBuffer;
      if (file.toBuffer) {
        fileBuffer = await file.toBuffer();
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.fileBuffer) {
        fileBuffer = file.fileBuffer;
      } else {
        throw new Error("File buffer is missing!");
      }

      await fs.writeFile(fullPath, fileBuffer);
      logger.info(
        `✅ Product main image uploaded for ${user.email} => ${fileName}`
      );
      return {
        type: "IMAGE",
        url: `/uploads/product/images/${fileName}`,
        mimeType: file.mimetype,
        size: fileSize,
        caption: file.caption || "",
        altText: file.altText || "",
        uploadedBy: user.id,
      };
    } catch (error) {
      logger.error(`❌ Error uploading product main image: ${error.message}`);
      throw error;
    }
  },

  uploadProductMedia: async (files, user, productId) => {
    try {
      if (files.length > 10) {
        throw new Error("Maximum 10 media files can be uploaded");
      }
      const uploadedFiles = [];
      for (const file of files) {
        if (!config.allowedProductFileTypes.includes(file.mimetype)) {
          throw new Error("Unsupported file type");
        }
        const fileSize = file.size || file.file?.bytesRead || 0;
        if (!fileSize || fileSize > config.maxFileSize) {
          throw new Error(
            fileSize
              ? "File size exceeds 20MB limit"
              : "File size is required and cannot be zero"
          );
        }
        await initDirectories();
        const { dir: targetDir, subPath } = getProductFileDir(
          file.mimetype,
          config
        );
        const fileExtension =
          file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
        const fileName = generateFileName(
          "product",
          user.username,
          productId || user.id,
          fileExtension
        );
        const fullPath = path.join(targetDir, fileName);

        let fileBuffer;
        if (file.toBuffer) {
          fileBuffer = await file.toBuffer();
        } else if (file.buffer) {
          fileBuffer = file.buffer;
        } else if (file.fileBuffer) {
          fileBuffer = file.fileBuffer;
        } else {
          throw new Error("File buffer is missing!");
        }

        await fs.writeFile(fullPath, fileBuffer);
        logger.info(
          `✅ Product media uploaded for ${user.email} => ${fileName}`
        );
        uploadedFiles.push({
          type: config.allowedImageTypes.includes(file.mimetype)
            ? "IMAGE"
            : config.allowedVideoTypes.includes(file.mimetype)
            ? "VIDEO"
            : "OTHER",
          url: `/uploads/product/${subPath}/${fileName}`,
          mimeType: file.mimetype,
          size: fileSize,
          caption: file.caption || "",
          altText: file.altText || "",
          uploadedBy: user.id,
        });
      }
      return uploadedFiles;
    } catch (error) {
      logger.error(`❌ Error uploading product media: ${error.message}`);
      throw error;
    }
  },

  uploadFestivalBannerImage: async (file, user) => {
    try {
      if (!config.allowedFestivalFileTypes.includes(file.mimetype)) {
        throw new Error(
          "Only JPEG, PNG, and GIF images are allowed for festival banner"
        );
      }

      const fileSize = file.size || file.file?.bytesRead || 0;
      if (!fileSize || fileSize > config.maxFileSize) {
        throw new Error(
          fileSize
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "festival-banner",
        user.username,
        user.id,
        fileExtension
      );
      const fullPath = path.join(config.festivalImageDir, fileName);

      let fileBuffer;
      if (file.toBuffer) {
        fileBuffer = await file.toBuffer();
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.fileBuffer) {
        fileBuffer = file.fileBuffer;
      } else {
        throw new Error("File buffer is missing!");
      }

      await fs.writeFile(fullPath, fileBuffer);
      logger.info(
        `✅ Festival banner image uploaded for ${user.email} => ${fileName}`
      );

      return {
        type: "IMAGE",
        url: `/uploads/festival/images/${fileName}`,
        mimeType: file.mimetype,
        size: fileSize,
        caption: file.caption || "",
        altText: file.altText || "",
        uploadedBy: user.id,
      };
    } catch (error) {
      logger.error(
        `❌ Error uploading festival banner image: ${error.message}`
      );
      throw error;
    }
  },

  uploadFestivalMedia: async (files, user, festivalId) => {
    try {
      if (files.length > 5) {
        throw new Error("Maximum 5 media files can be uploaded for festival");
      }

      const uploadedFiles = [];
      for (const file of files) {
        if (!config.allowedFestivalFileTypes.includes(file.mimetype)) {
          throw new Error(
            "Only JPEG, PNG, and GIF images are allowed for festival media"
          );
        }

        const fileSize = file.size || file.file?.bytesRead || 0;
        if (!fileSize || fileSize > config.maxFileSize) {
          throw new Error(
            fileSize
              ? "File size exceeds 20MB limit"
              : "File size is required and cannot be zero"
          );
        }

        await initDirectories();
        const { dir: targetDir, subPath } = getFestivalFileDir(
          file.mimetype,
          config
        );
        const fileExtension =
          file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
        const fileName = generateFileName(
          "festival",
          user.username,
          festivalId || user.id,
          fileExtension
        );
        const fullPath = path.join(targetDir, fileName);

        let fileBuffer;
        if (file.toBuffer) {
          fileBuffer = await file.toBuffer();
        } else if (file.buffer) {
          fileBuffer = file.buffer;
        } else if (file.fileBuffer) {
          fileBuffer = file.fileBuffer;
        } else {
          throw new Error("File buffer is missing!");
        }

        await fs.writeFile(fullPath, fileBuffer);
        logger.info(
          `✅ Festival media uploaded for ${user.email} => ${fileName}`
        );

        uploadedFiles.push({
          type: "IMAGE",
          url: `/uploads/festival/${subPath}/${fileName}`,
          mimeType: file.mimetype,
          size: fileSize,
          caption: file.caption || "",
          altText: file.altText || "",
          uploadedBy: user.id,
        });
      }

      return uploadedFiles;
    } catch (error) {
      logger.error(`❌ Error uploading festival media: ${error.message}`);
      throw error;
    }
  },

  uploadCategoryImage: async (file, user) => {
    try {
      if (!config.allowedCategoryFileTypes.includes(file.mimetype)) {
        throw new Error(
          "Only JPEG, PNG, and GIF images are allowed for category image"
        );
      }

      const fileSize = file.size || file.file?.bytesRead || 0;
      if (!fileSize || fileSize > config.maxFileSize) {
        throw new Error(
          fileSize
            ? "File size exceeds 20MB limit"
            : "File size is required and cannot be zero"
        );
      }

      await initDirectories();
      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "category",
        user.username,
        user.id,
        fileExtension
      );
      const fullPath = path.join(config.categoryImageDir, fileName);

      let fileBuffer;
      if (file.toBuffer) {
        fileBuffer = await file.toBuffer();
      } else if (file.buffer) {
        fileBuffer = file.buffer;
      } else if (file.fileBuffer) {
        fileBuffer = file.fileBuffer;
      } else {
        throw new Error("File buffer is missing!");
      }

      await fs.writeFile(fullPath, fileBuffer);
      logger.info(
        `✅ Category image uploaded for ${user.email} => ${fileName}`
      );

      return {
        type: "IMAGE",
        url: `/uploads/category/images/${fileName}`,
        mimeType: file.mimetype,
        size: fileSize,
        caption: file.caption || "",
        altText: file.altText || "",
        uploadedBy: user.id,
      };
    } catch (error) {
      logger.error(`❌ Error uploading category image: ${error.message}`);
      throw error;
    }
  },
};

module.exports = fileUploader;
