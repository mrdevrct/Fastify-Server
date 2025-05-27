const mongoose = require("mongoose");
const Article = require("../model/article.model");
const { logger } = require("../../../utils/logger/logger");

const articleService = {
  createArticle: async (articleData, user) => {
    try {
      const newArticle = new Article({
        title: articleData.title,
        slug: articleData.slug,
        content: articleData.content,
        coverImage: {
          ...articleData.coverImage,
          uploadedBy: user.id,
        },
        media: articleData.media
          ? articleData.media.map((m) => ({ ...m, uploadedBy: user.id }))
          : [],
        authorId: user.id,
        authorName: articleData.authorName || user.username || user.email,
        email: articleData.email || user.email,
        category: articleData.category || "OTHER",
        tags: articleData.tags || [],
        keywords: articleData.keywords || [],
        metaTitle: articleData.metaTitle,
        metaDescription: articleData.metaDescription,
        status: articleData.status || "DRAFT",
        priority: articleData.priority || "LOW",
      });

      await newArticle.save();
      return newArticle;
    } catch (error) {
      logger.error(`Error creating article: ${error.message}`);
      throw error;
    }
  },

  getMyArticles: async (user, page = 1, perPage = 20) => {
    try {
      const filter = {
        $or: [{ authorId: user.id }, { email: user.email }],
      };

      const skip = (page - 1) * perPage;

      const [articles, total] = await Promise.all([
        Article.find(filter)
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean()
          .exec(),
        Article.countDocuments(filter),
      ]);

      const formattedArticles = articles.map((article) => ({
        id: article._id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        coverImage: article.coverImage,
        media: article.media,
        authorId: article.authorId,
        authorName: article.authorName,
        email: article.email,
        category: article.category,
        tags: article.tags,
        keywords: article.keywords,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        status: article.status,
        priority: article.priority,
        views: article.views,
        likes: article.likes,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));

      return { articles: formattedArticles, total };
    } catch (error) {
      logger.error(`Error fetching my articles: ${error.message}`);
      throw error;
    }
  },

  getAllArticles: async (page = 1, perPage = 20) => {
    try {
      const skip = (page - 1) * perPage;

      const [articles, total] = await Promise.all([
        Article.find({})
          .sort({ updatedAt: -1 })
          .skip(skip)
          .limit(perPage)
          .lean()
          .exec(),
        Article.countDocuments({}),
      ]);

      const formattedArticles = articles.map((article) => ({
        id: article._id,
        title: article.title,
        slug: article.slug,
        content: article.content,
        coverImage: article.coverImage,
        media: article.media,
        authorId: article.authorId,
        authorName: article.authorName,
        email: article.email,
        category: article.category,
        tags: article.tags,
        keywords: article.keywords,
        metaTitle: article.metaTitle,
        metaDescription: article.metaDescription,
        status: article.status,
        priority: article.priority,
        views: article.views,
        likes: article.likes,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt,
      }));

      return { articles: formattedArticles, total };
    } catch (error) {
      logger.error(`Error fetching all articles: ${error.message}`);
      throw error;
    }
  },

  getArticle: async (identifier, user) => {
    try {
      const query = mongoose.Types.ObjectId.isValid(identifier)
        ? { _id: identifier }
        : { slug: identifier };

      const article = await Article.findOne(query).lean().exec();
      if (!article) {
        throw new Error("Article not found");
      }

      const isOwner =
        article.authorId.toString() === user.id || article.email === user.email;
      const hasAccess =
        user?.featureAccess?.some((f) => f.feature === "ARTICLES:LIST") ||
        user.userType === "ADMIN";

      if (!isOwner && !hasAccess) {
        throw new Error("You do not have permission to view this article");
      }

      return article;
    } catch (error) {
      logger.error(`Error fetching article: ${error.message}`);
      throw error;
    }
  },

  updateArticle: async (articleId, updateData, user) => {
    try {
      const allowedAdmins = ["ADMIN", "SUPER_ADMIN"];
      if (!allowedAdmins.includes(user.adminStatus)) {
        throw new Error("You are not authorized to update articles");
      }

      const hasFullAccess = user.featureAccess?.some(
        (f) => f.feature === "EDIT_ARTICLE" && f.access === "FULL_ACCESS"
      );
      if (!hasFullAccess) {
        throw new Error("You do not have access to edit articles");
      }

      const article = await Article.findById(articleId);
      if (!article) throw new Error("Article not found");

      if (updateData.title) article.title = updateData.title;
      if (updateData.slug) article.slug = updateData.slug;
      if (updateData.content) article.content = updateData.content;
      if (updateData.coverImage)
        article.coverImage = { ...updateData.coverImage, uploadedBy: user.id };
      if (updateData.media) {
        article.media = updateData.media.map((m) => ({
          ...m,
          uploadedBy: user.id,
        }));
      }
      if (updateData.category) article.category = updateData.category;
      if (updateData.tags) article.tags = updateData.tags;
      if (updateData.keywords) article.keywords = updateData.keywords;
      if (updateData.metaTitle) article.metaTitle = updateData.metaTitle;
      if (updateData.metaDescription)
        article.metaDescription = updateData.metaDescription;
      if (updateData.status) article.status = updateData.status;
      if (updateData.priority) article.priority = updateData.priority;

      article.updatedAt = new Date();
      await article.save();

      return article;
    } catch (error) {
      logger.error(`Error updating article: ${error.message}`);
      throw error;
    }
  },

  deleteArticle: async (articleId, user) => {
    try {
      const allowedAdmins = ["ADMIN", "SUPER_ADMIN"];
      if (!allowedAdmins.includes(user.adminStatus)) {
        throw new Error("You are not authorized to delete articles");
      }

      const article = await Article.findById(articleId);
      if (!article) throw new Error("Article not found");

      await article.remove();
      return true;
    } catch (error) {
      logger.error(`Error deleting article: ${error.message}`);
      throw error;
    }
  },

  addComment: async (articleId, commentData, user) => {
    try {
      const article = await Article.findById(articleId);
      if (!article) throw new Error("Article not found");

      const newComment = {
        isAuthor: article.authorId.toString() === user.id,
        authorId: user.id,
        authorName: user.username || user.email,
        commentText: commentData.commentText,
        isRead: false,
        createdAt: new Date(),
        replyTo: commentData.replyTo || null,
      };

      article.comments.push(newComment);
      article.updatedAt = new Date();
      await article.save();

      return article;
    } catch (error) {
      logger.error(`Error adding comment: ${error.message}`);
      throw error;
    }
  },

  markCommentsAsRead: async (articleId, user) => {
    try {
      const article = await Article.findById(articleId);
      if (!article) throw new Error("Article not found");

      const isOwner =
        article.authorId.toString() === user.id || article.email === user.email;
      const hasAccess =
        user?.featureAccess?.some((f) => f.feature === "ALL_ARTICLES") ||
        user.userType === "ADMIN";

      if (!isOwner && !hasAccess) {
        throw new Error("You do not have permission to update this article");
      }

      let updated = false;
      article.comments.forEach((comment) => {
        if (
          comment.isAuthor !== (user.id === article.authorId.toString()) &&
          !comment.isRead
        ) {
          comment.isRead = true;
          updated = true;
        }
      });

      if (updated) {
        article.updatedAt = new Date();
        await article.save();
      }

      return true;
    } catch (error) {
      logger.error(`Error marking comments as read: ${error.message}`);
      throw error;
    }
  },

  likeArticle: async (articleId, user) => {
    try {
      const article = await Article.findById(articleId);
      if (!article) throw new Error("Article not found");

      if (!article.likes.includes(user.id)) {
        article.likes.push(user.id);
        article.updatedAt = new Date();
        await article.save();
      }

      return article;
    } catch (error) {
      logger.error(`Error liking article: ${error.message}`);
      throw error;
    }
  },
};

module.exports = { articleService };
