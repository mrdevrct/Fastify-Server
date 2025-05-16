const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { articleService } = require("../service/article.service");

const articleController = {
  createArticle: async (request, reply) => {
    try {
      const user = request.user;
      const articleData = {};
      let coverImageData = null;
      let mediaData = [];

      // پردازش داده‌های multipart/form-data
      const parts = request.parts();
      for await (const part of parts) {
        if (part.type === "file") {
          if (part.fieldname === "coverImage") {
            const fileBuffer = await part.toBuffer();
            const fileSize = fileBuffer.length;
            if (!fileSize) {
              return reply
                .status(400)
                .send(
                  formatResponse({}, true, "Invalid cover image size", 400)
                );
            }
            coverImageData = { ...part, size: fileSize, fileBuffer };
          } else if (part.fieldname === "media") {
            const fileBuffer = await part.toBuffer();
            const fileSize = fileBuffer.length;
            if (!fileSize) {
              return reply
                .status(400)
                .send(formatResponse({}, true, "Invalid media file size", 400));
            }
            mediaData.push({ ...part, size: fileSize, fileBuffer });
          }
        } else if (part.type === "field") {
          if (part.fieldname.endsWith("[]")) {
            const fieldName = part.fieldname.slice(0, -2);
            articleData[fieldName] = articleData[fieldName] || [];
            articleData[fieldName].push(part.value);
          } else {
            articleData[part.fieldname] = part.value;
          }
        }
      }

      // اعتبارسنجی فیلدهای اجباری
      if (!articleData.title || !articleData.content) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Title and content are required", 400)
          );
      }

      // تولید slug اگر غایب باشد
      if (!articleData.slug) {
        articleData.slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // اعتبارسنجی تصویر کاور
      if (!coverImageData && !articleData.coverImage) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Cover image is required", 400));
      }

      // محدودیت تعداد رسانه‌ها
      if (mediaData.length > 10) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Maximum 10 media files allowed", 400)
          );
      }

      // آپلود تصویر کاور
      const coverImage = coverImageData
        ? await fileUploader.uploadArticleCoverImage(coverImageData, user)
        : articleData.coverImage;

      // آپلود رسانه‌ها
      const media =
        mediaData.length > 0
          ? await fileUploader.uploadArticleMedia(
              mediaData,
              user,
              articleData._id
            )
          : articleData.media || [];

      // ایجاد مقاله
      const newArticle = await articleService.createArticle(
        { ...articleData, coverImage, media },
        user
      );

      logger.info(`Article created by user: ${user.email}`);
      return reply
        .status(201)
        .send(formatResponse(newArticle, false, null, 201));
    } catch (error) {
      logger.error(`Error creating article: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getMyArticles: async (request, reply) => {
    try {
      const user = request.user;

      const myArticlesAccess = user.featureAccess.find(
        (f) => f.feature === "MY_ARTICLES"
      );
      if (!myArticlesAccess || myArticlesAccess.access !== "FULL_ACCESS") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "You do not have access to your articles",
              403
            )
          );
      }

      const articles = await articleService.getMyArticles(user);
      const sanitizedArticles = articles.map((article) => ({
        ...article.toObject(),
        comments: [],
      }));

      logger.info(`Articles retrieved for user ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(sanitizedArticles, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving user articles: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getAllArticles: async (request, reply) => {
    try {
      const user = request.user;

      const allArticlesAccess = user.featureAccess.find();
      if (!allArticlesAccess || allArticlesAccess.access !== "FULL_ACCESS") {
        return reply
          .status(403)
          .send(
            formatResponse(
              {},
              true,
              "You do not have access to all articles",
              403
            )
          );
      }

      const articles = await articleService.getAllArticles();
      const sanitizedArticles = articles.map((article) => ({
        ...article.toObject(),
        comments: [],
      }));

      logger.info(`All articles retrieved by user ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(sanitizedArticles, false, null, 200));
    } catch (error) {
      logger.error(`Error retrieving all articles: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  getArticle: async (request, reply) => {
    try {
      const user = request.user;
      const { identifier } = request.params;

      const article = await articleService.getArticle(identifier, user);
      await article.incrementViews();

      logger.info(`Article ${identifier} retrieved by ${user.email}`);
      return reply.status(200).send(formatResponse(article, false, null, 200));
    } catch (error) {
      logger.error(`Error fetching article: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  updateArticle: async (request, reply) => {
    try {
      const user = request.user;
      const { articleId } = request.params;
      const updateData = request.body;

      const parts = request.parts();
      let coverImageData = null;
      let mediaData = [];

      for await (const part of parts) {
        if (part.type === "file" && part.fieldname === "coverImage") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid cover image size", 400));
          }
          coverImageData = { ...part, size: fileSize, fileBuffer };
        } else if (part.type === "file" && part.fieldname === "media") {
          const fileBuffer = await part.toBuffer();
          const fileSize = fileBuffer.length;
          if (!fileSize) {
            return reply
              .status(400)
              .send(formatResponse({}, true, "Invalid media file size", 400));
          }
          mediaData.push({ ...part, size: fileSize, fileBuffer });
        }
      }

      let coverImage = updateData.coverImage;
      if (coverImageData) {
        coverImage = await fileUploader.uploadArticleCoverImage(
          coverImageData,
          user
        );
      }

      let media = updateData.media || [];
      if (mediaData.length > 0) {
        const uploadedMedia = await fileUploader.uploadArticleMedia(
          mediaData,
          user
        );
        media = [...media, ...uploadedMedia];
      }

      const article = await articleService.updateArticle(
        articleId,
        { ...updateData, coverImage, media },
        user
      );

      logger.info(`Article ${articleId} updated by user ${user.email}`);
      return reply.status(200).send(formatResponse(article, false, null, 200));
    } catch (error) {
      logger.error(`Error updating article: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  deleteArticle: async (request, reply) => {
    try {
      const user = request.user;
      const { articleId } = request.params;

      await articleService.deleteArticle(articleId, user);

      logger.info(`Article ${articleId} deleted by user ${user.email}`);
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error deleting article: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  addComment: async (request, reply) => {
    try {
      const user = request.user;
      const { articleId } = request.params;
      const { commentText, replyTo } = request.body;

      if (!commentText) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Comment text is required", 400));
      }

      const article = await articleService.addComment(
        articleId,
        { commentText, replyTo },
        user
      );

      logger.info(
        `Comment added to article ${articleId} by user ${user.email}`
      );
      return reply.status(200).send(formatResponse(article, false, null, 200));
    } catch (error) {
      logger.error(`Error adding comment: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  markCommentsAsRead: async (request, reply) => {
    try {
      const user = request.user;
      const { articleId } = request.params;

      await articleService.markCommentsAsRead(articleId, user);

      logger.info(
        `Comments marked as read for article ${articleId} by ${user.email}`
      );
      return reply.status(200).send(formatResponse({}, false, null, 200));
    } catch (error) {
      logger.error(`Error marking comments as read: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },

  likeArticle: async (request, reply) => {
    try {
      const user = request.user;
      const { articleId } = request.params;

      const article = await articleService.likeArticle(articleId, user);

      logger.info(`Article ${articleId} liked by user ${user.email}`);
      return reply.status(200).send(formatResponse(article, false, null, 200));
    } catch (error) {
      logger.error(`Error liking article: ${error.message}`);
      return reply
        .status(400)
        .send(formatResponse({}, true, error.message, 400));
    }
  },
};

module.exports = { articleController };
