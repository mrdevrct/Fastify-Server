const validateMiddleware = require("../../../middlewares/validation/validate.middleware");
const { articleController } = require("../controller/article.controller");
const { createArticleDto, updateArticleDto } = require("../dto/article.dto");

const articleRoutes = async (fastify, options) => {
  // Create article
  fastify.post(
    "/",
    {
      preValidation: [fastify.auth],
    },
    articleController.createArticle
  );

  // Get my articles
  fastify.get(
    "/my-articles",
    {
      preValidation: [fastify.auth],
    },
    articleController.getMyArticles
  );

  // Get all articles
  fastify.get(
    "/all-articles",
    {
      preValidation: [fastify.auth],
    },
    articleController.getAllArticles
  );

  // Get article by ID or slug
  fastify.get(
    "/:identifier",
    {
      preValidation: [fastify.auth],
    },
    articleController.getArticle
  );

  // Update article
  fastify.put(
    "/:articleId",
    {
      preValidation: [fastify.auth, validateMiddleware(updateArticleDto)],
    },
    articleController.updateArticle
  );

  // Delete article
  fastify.delete(
    "/:articleId",
    {
      preValidation: [fastify.auth],
    },
    articleController.deleteArticle
  );

  // Add comment
  fastify.post(
    "/:articleId/comment",
    {
      preValidation: [fastify.auth],
    },
    articleController.addComment
  );

  // Mark comments as read
  fastify.put(
    "/:articleId/comments/read",
    {
      preValidation: [fastify.auth],
    },
    articleController.markCommentsAsRead
  );

  // Like article
  fastify.post(
    "/:articleId/like",
    {
      preValidation: [fastify.auth],
    },
    articleController.likeArticle
  );
};

module.exports = articleRoutes;
