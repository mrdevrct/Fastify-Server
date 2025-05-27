const { logger } = require("../../../utils/logger/logger");
const { formatResponse } = require("../../../utils/response/formatResponse");
const fileUploader = require("../../../utils/uploader/fileUploader");
const { articleService } = require("../service/article.service");
const { paginate } = require("../../../utils/pagination/paginate"); // اضافه کردن ماژول paginate
const {
  notificationService,
} = require("../../notification/service/notification.service");
const {
  NOTIFICATION_TYPES,
} = require("../../../utils/notification/notification.enums");

const articleController = {
  createArticle: async (request, reply) => {
    try {
      const user = request.user;
      const articleData = {};
      let coverImageData = null;
      let mediaData = [];

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

      if (!articleData.title || !articleData.content) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Title and content are required", 400)
          );
      }

      if (!articleData.slug) {
        articleData.slug = articleData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      if (!coverImageData && !articleData.coverImage) {
        return reply
          .status(400)
          .send(formatResponse({}, true, "Cover image is required", 400));
      }

      if (mediaData.length > 10) {
        return reply
          .status(400)
          .send(
            formatResponse({}, true, "Maximum 10 media files allowed", 400)
          );
      }

      const coverImage = coverImageData
        ? await fileUploader.uploadArticleCoverImage(coverImageData, user)
        : articleData.coverImage;

      const media =
        mediaData.length > 0
          ? await fileUploader.uploadArticleMedia(
              mediaData,
              user,
              articleData._id
            )
          : articleData.media || [];

      const newArticle = await articleService.createArticle(
        { ...articleData, coverImage, media },
        user
      );

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.ADD_ARTICLE,
        `New article created: ${newArticle.title}`,
        {
          articleId: newArticle._id.toString(),
          title: newArticle.title,
          slug: newArticle.slug,
          timestamp: new Date().toISOString(),
        }
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
      const { page, perPage } = request.query;

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

      const pageNum = Math.max(parseInt(page) || 1, 1);
      const perPageNum =
        parseInt(perPage) || parseInt(process.env.ARTICLES_PER_PAGE) || 20;

      const { articles, total } = await articleService.getMyArticles(
        user,
        pageNum,
        perPageNum
      );
      const pagination = paginate({
        total,
        page: pageNum,
        perPage: perPageNum,
      });

      const sanitizedArticles = articles.map((article) => ({
        ...article,
        comments: [],
      }));

      logger.info(`Articles retrieved for user ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(sanitizedArticles, false, null, 200, pagination));
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
      const { page, perPage } = request.query;

      const allArticlesAccess = user.featureAccess.find(
        (f) => f.feature === "ALL_ARTICLES"
      );
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

      const pageNum = Math.max(parseInt(page) || 1, 1);
      const perPageNum =
        parseInt(perPage) || parseInt(process.env.ARTICLES_PER_PAGE) || 20;

      const { articles, total } = await articleService.getAllArticles(
        pageNum,
        perPageNum
      );
      const pagination = paginate({
        total,
        page: pageNum,
        perPage: perPageNum,
      });

      const sanitizedArticles = articles.map((article) => ({
        ...article,
        comments: [],
      }));

      logger.info(`All articles retrieved by user ${user.email}`);
      return reply
        .status(200)
        .send(formatResponse(sanitizedArticles, false, null, 200, pagination));
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
      const updateData = {};
      let coverImageData = null;
      let mediaData = [];

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
            updateData[fieldName] = updateData[fieldName] || [];
            updateData[fieldName].push(part.value);
          } else {
            updateData[part.fieldname] = part.value;
          }
        }
      }

      if (updateData.title && !updateData.slug) {
        updateData.slug = updateData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
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

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.UPDATE_ARTICLE,
        `Article updated: ${article.title}`,
        {
          articleId: article._id.toString(),
          title: article.title,
          slug: article.slug,
          timestamp: new Date().toISOString(),
        }
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

      const article = await articleService.getArticle(articleId, user);
      await articleService.deleteArticle(articleId, user);

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.REMOVE_ARTICLE,
        `Article deleted: ${article.title}`,
        {
          articleId: article._id.toString(),
          title: article.title,
          slug: article.slug,
          timestamp: new Date().toISOString(),
        }
      );

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

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.GENERAL_NOTIFICATION,
        `New comment added to article: ${article.title}`,
        {
          articleId: article._id.toString(),
          title: article.title,
          commentText,
          commenter: user.email,
          timestamp: new Date().toISOString(),
        }
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

      await notificationService.createAndSendNotification(
        request.server,
        user.id,
        NOTIFICATION_TYPES.GENERAL_NOTIFICATION,
        `Article liked: ${article.title}`,
        {
          articleId: article._id.toString(),
          title: article.title,
          liker: user.email,
          timestamp: new Date().toISOString(),
        }
      );

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
