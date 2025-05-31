const fs = require("fs").promises;
const path = require("path");
const cloudinary = require("cloudinary").v2;
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

// پیکربندی Cloudinary
if (process.env.NODE_ENV === "production") {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

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

      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "user",
        user.username,
        user.id,
        fileExtension
      );

      let fileUrl;
      if (process.env.NODE_ENV === "production") {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `user/images/${fileName}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        fileUrl = result.secure_url;
        logger.info(
          `✅ Profile image uploaded to Cloudinary for ${user.email} => ${fileName}`
        );
      } else {
        await initDirectories();
        const fullPath = path.join(config.userImageDir, fileName);
        await fs.writeFile(fullPath, fileBuffer);
        fileUrl = `/uploads/user/images/${fileName}`;
        logger.info(
          `✅ Profile image uploaded locally for ${user.email} => ${fileName}`
        );
      }

      return fileUrl;
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

      const fileExtension =
        file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
      const fileName = generateFileName(
        "ticket",
        user.username,
        ticketId,
        fileExtension
      );

      let fileUrl, subPath;
      if (process.env.NODE_ENV === "production") {
        const { subPath: cloudinarySubPath } = getTicketFileDir(
          file.mimetype,
          config
        );
        const resourceType = config.allowedImageTypes.includes(file.mimetype)
          ? "image"
          : config.allowedVideoTypes.includes(file.mimetype)
          ? "video"
          : "raw";

        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `ticket/${cloudinarySubPath}/${fileName}`,
              resource_type: resourceType,
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        fileUrl = result.secure_url;
        subPath = cloudinarySubPath;
        logger.info(
          `✅ Ticket file uploaded to Cloudinary for ${user.email} => ${fileName}`
        );
      } else {
        await initDirectories();
        const { dir: targetDir, subPath: localSubPath } = getTicketFileDir(
          file.mimetype,
          config
        );
        const fullPath = path.join(targetDir, fileName);
        await fs.writeFile(fullPath, fileBuffer);
        fileUrl = `/uploads/ticket/${localSubPath}/${fileName}`;
        subPath = localSubPath;
        logger.info(
          `✅ Ticket file uploaded locally for ${user.email} => ${fileName}`
        );
      }

      return {
        name: file.filename,
        size: fileSize,
        format: file.mimetype,
        path: fileUrl,
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

      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "article-cover",
        user.username,
        user.id,
        fileExtension
      );

      let fileUrl;
      if (process.env.NODE_ENV === "production") {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `article/images/${fileName}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        fileUrl = result.secure_url;
        logger.info(
          `✅ Article cover image uploaded to Cloudinary for ${user.email} => ${fileName}`
        );
      } else {
        await initDirectories();
        const fullPath = path.join(config.articleImageDir, fileName);
        await fs.writeFile(fullPath, fileBuffer);
        fileUrl = `/uploads/article/images/${fileName}`;
        logger.info(
          `✅ Article cover image uploaded locally for ${user.email} => ${fileName}`
        );
      }

      return {
        type: "IMAGE",
        url: fileUrl,
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

        const fileExtension =
          file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
        const fileName = generateFileName(
          "article",
          user.username,
          articleId || user.id,
          fileExtension
        );

        let fileUrl, subPath;
        if (process.env.NODE_ENV === "production") {
          const { subPath: cloudinarySubPath } = getArticleFileDir(
            file.mimetype,
            config
          );
          const resourceType = config.allowedImageTypes.includes(file.mimetype)
            ? "image"
            : config.allowedVideoTypes.includes(file.mimetype)
            ? "video"
            : config.allowedAudioTypes.includes(file.mimetype)
            ? "audio"
            : "raw";

          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                public_id: `article/${cloudinarySubPath}/${fileName}`,
                resource_type: resourceType,
              },
              (error, result) => {
                if (error)
                  reject(
                    new Error(`Cloudinary upload failed: ${error.message}`)
                  );
                resolve(result);
              }
            );
            stream.end(fileBuffer);
          });

          fileUrl = result.secure_url;
          subPath = cloudinarySubPath;
          logger.info(
            `✅ Article media uploaded to Cloudinary for ${user.email} => ${fileName}`
          );
        } else {
          await initDirectories();
          const { dir: targetDir, subPath: localSubPath } = getArticleFileDir(
            file.mimetype,
            config
          );
          const fullPath = path.join(targetDir, fileName);
          await fs.writeFile(fullPath, fileBuffer);
          fileUrl = `/uploads/article/${localSubPath}/${fileName}`;
          subPath = localSubPath;
          logger.info(
            `✅ Article media uploaded locally for ${user.email} => ${fileName}`
          );
        }

        uploadedFiles.push({
          type: config.allowedImageTypes.includes(file.mimetype)
            ? "IMAGE"
            : config.allowedVideoTypes.includes(file.mimetype)
            ? "VIDEO"
            : config.allowedAudioTypes.includes(file.mimetype)
            ? "AUDIO"
            : "OTHER",
          url: fileUrl,
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

      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "product-main",
        user.username,
        user.id,
        fileExtension
      );

      let fileUrl;
      if (process.env.NODE_ENV === "production") {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `product/images/${fileName}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        fileUrl = result.secure_url;
        logger.info(
          `✅ Product main image uploaded to Cloudinary for ${user.email} => ${fileName}`
        );
      } else {
        await initDirectories();
        const fullPath = path.join(config.productImageDir, fileName);
        await fs.writeFile(fullPath, fileBuffer);
        fileUrl = `/uploads/product/images/${fileName}`;
        logger.info(
          `✅ Product main image uploaded locally for ${user.email} => ${fileName}`
        );
      }

      return {
        type: "IMAGE",
        url: fileUrl,
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

        const fileExtension =
          file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
        const fileName = generateFileName(
          "product",
          user.username,
          productId || user.id,
          fileExtension
        );

        let fileUrl, subPath;
        if (process.env.NODE_ENV === "production") {
          const { subPath: cloudinarySubPath } = getProductFileDir(
            file.mimetype,
            config
          );
          const resourceType = config.allowedImageTypes.includes(file.mimetype)
            ? "image"
            : config.allowedVideoTypes.includes(file.mimetype)
            ? "video"
            : "raw";

          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                public_id: `product/${cloudinarySubPath}/${fileName}`,
                resource_type: resourceType,
              },
              (error, result) => {
                if (error)
                  reject(
                    new Error(`Cloudinary upload failed: ${error.message}`)
                  );
                resolve(result);
              }
            );
            stream.end(fileBuffer);
          });

          fileUrl = result.secure_url;
          subPath = cloudinarySubPath;
          logger.info(
            `✅ Product media uploaded to Cloudinary for ${user.email} => ${fileName}`
          );
        } else {
          await initDirectories();
          const { dir: targetDir, subPath: localSubPath } = getProductFileDir(
            file.mimetype,
            config
          );
          const fullPath = path.join(targetDir, fileName);
          await fs.writeFile(fullPath, fileBuffer);
          fileUrl = `/uploads/product/${localSubPath}/${fileName}`;
          subPath = localSubPath;
          logger.info(
            `✅ Product media uploaded locally for ${user.email} => ${fileName}`
          );
        }

        uploadedFiles.push({
          type: config.allowedImageTypes.includes(file.mimetype)
            ? "IMAGE"
            : config.allowedVideoTypes.includes(file.mimetype)
            ? "VIDEO"
            : "OTHER",
          url: fileUrl,
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

      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "festival-banner",
        user.username,
        user.id,
        fileExtension
      );

      let fileUrl;
      if (process.env.NODE_ENV === "production") {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `festival/images/${fileName}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        fileUrl = result.secure_url;
        logger.info(
          `✅ Festival banner image uploaded to Cloudinary for ${user.email} => ${fileName}`
        );
      } else {
        await initDirectories();
        const fullPath = path.join(config.festivalImageDir, fileName);
        await fs.writeFile(fullPath, fileBuffer);
        fileUrl = `/uploads/festival/images/${fileName}`;
        logger.info(
          `✅ Festival banner image uploaded locally for ${user.email} => ${fileName}`
        );
      }

      return {
        type: "IMAGE",
        url: fileUrl,
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

        const fileExtension =
          file.mimetype.split("/")[1] || path.extname(file.filename).slice(1);
        const fileName = generateFileName(
          "festival",
          user.username,
          festivalId || user.id,
          fileExtension
        );

        let fileUrl, subPath;
        if (process.env.NODE_ENV === "production") {
          const { subPath: cloudinarySubPath } = getFestivalFileDir(
            file.mimetype,
            config
          );
          const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.uploader.upload_stream(
              {
                public_id: `festival/${cloudinarySubPath}/${fileName}`,
                resource_type: "image",
              },
              (error, result) => {
                if (error)
                  reject(
                    new Error(`Cloudinary upload failed: ${error.message}`)
                  );
                resolve(result);
              }
            );
            stream.end(fileBuffer);
          });

          fileUrl = result.secure_url;
          subPath = cloudinarySubPath;
          logger.info(
            `✅ Festival media uploaded to Cloudinary for ${user.email} => ${fileName}`
          );
        } else {
          await initDirectories();
          const { dir: targetDir, subPath: localSubPath } = getFestivalFileDir(
            file.mimetype,
            config
          );
          const fullPath = path.join(targetDir, fileName);
          await fs.writeFile(fullPath, fileBuffer);
          fileUrl = `/uploads/festival/${localSubPath}/${fileName}`;
          subPath = localSubPath;
          logger.info(
            `✅ Festival media uploaded locally for ${user.email} => ${fileName}`
          );
        }

        uploadedFiles.push({
          type: "IMAGE",
          url: fileUrl,
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

      const fileExtension = file.mimetype.split("/")[1];
      const fileName = generateFileName(
        "category",
        user.username,
        user.id,
        fileExtension
      );

      let fileUrl;
      if (process.env.NODE_ENV === "production") {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              public_id: `category/images/${fileName}`,
              resource_type: "image",
            },
            (error, result) => {
              if (error)
                reject(new Error(`Cloudinary upload failed: ${error.message}`));
              resolve(result);
            }
          );
          stream.end(fileBuffer);
        });

        fileUrl = result.secure_url;
        logger.info(
          `✅ Category image uploaded to Cloudinary for ${user.email} => ${fileName}`
        );
      } else {
        await initDirectories();
        const fullPath = path.join(config.categoryImageDir, fileName);
        await fs.writeFile(fullPath, fileBuffer);
        fileUrl = `/uploads/category/images/${fileName}`;
        logger.info(
          `✅ Category image uploaded locally for ${user.email} => ${fileName}`
        );
      }

      return {
        type: "IMAGE",
        url: fileUrl,
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
