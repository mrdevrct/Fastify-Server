const createArticleDto = {
  type: "object",
  required: [
    "title",
    "content",
    "coverImage",
    "authorId",
    "authorName",
    "email",
  ],
  properties: {
    title: { type: "string", maxLength: 200 },
    content: { type: "string" },
    coverImage: {
      type: "object",
      required: ["type", "url", "uploadedBy"],
      properties: {
        type: { type: "string", enum: ["IMAGE"] },
        url: { type: "string" },
        mimeType: { type: "string", nullable: true },
        size: { type: "number", nullable: true },
        caption: { type: "string", nullable: true },
        altText: { type: "string", nullable: true },
        uploadedBy: { type: "string" },
      },
    },
    media: {
      type: "array",
      items: {
        type: "object",
        required: ["type", "url", "uploadedBy"],
        properties: {
          type: {
            type: "string",
            enum: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"],
          },
          url: { type: "string" },
          mimeType: { type: "string", nullable: true },
          size: { type: "number", nullable: true },
          caption: { type: "string", nullable: true },
          altText: { type: "string", nullable: true },
          uploadedBy: { type: "string" },
        },
      },
      maxItems: 10,
    },
    authorId: { type: "string" },
    authorName: { type: "string" },
    email: { type: "string", format: "email" },
    category: {
      type: "string",
      enum: ["TECHNOLOGY", "SCIENCE", "LIFESTYLE", "EDUCATION", "OTHER"],
    },
    tags: { type: "array", items: { type: "string" }, maxItems: 10 },
    keywords: { type: "array", items: { type: "string" }, maxItems: 10 },
    metaTitle: { type: "string", maxLength: 70 },
    metaDescription: { type: "string", maxLength: 160 },
    status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
  },
};

const updateArticleDto = {
  type: "object",
  properties: {
    title: { type: "string", maxLength: 200 },
    content: { type: "string" },
    coverImage: {
      type: "object",
      properties: {
        type: { type: "string", enum: ["IMAGE"] },
        url: { type: "string" },
        mimeType: { type: "string", nullable: true },
        size: { type: "number", nullable: true },
        caption: { type: "string", nullable: true },
        altText: { type: "string", nullable: true },
        uploadedBy: { type: "string" },
      },
    },
    media: {
      type: "array",
      items: {
        type: "object",
        properties: {
          type: {
            type: "string",
            enum: ["IMAGE", "VIDEO", "AUDIO", "DOCUMENT", "OTHER"],
          },
          url: { type: "string" },
          mimeType: { type: "string", nullable: true },
          size: { type: "number", nullable: true },
          caption: { type: "string", nullable: true },
          altText: { type: "string", nullable: true },
          uploadedBy: { type: "string" },
        },
      },
      maxItems: 10,
    },
    category: {
      type: "string",
      enum: ["TECHNOLOGY", "SCIENCE", "LIFESTYLE", "EDUCATION", "OTHER"],
    },
    tags: { type: "array", items: { type: "string" }, maxItems: 10 },
    keywords: { type: "array", items: { type: "string" }, maxItems: 10 },
    metaTitle: { type: "string", maxLength: 70 },
    metaDescription: { type: "string", maxLength: 160 },
    status: { type: "string", enum: ["DRAFT", "PUBLISHED", "ARCHIVED"] },
    priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH"] },
  },
};

module.exports = { createArticleDto, updateArticleDto };
