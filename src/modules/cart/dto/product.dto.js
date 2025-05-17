const createProductDto = {
  type: "object",
  required: ["name", "description", "mainImage", "price", "stock"],
  properties: {
    name: { type: "string", maxLength: 200 },
    description: { type: "string" },
    mainImage: {
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
            enum: ["IMAGE", "VIDEO", "DOCUMENT", "OTHER"],
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
    price: { type: "number", minimum: 0 },
    discountPrice: { type: "number", minimum: 0, nullable: true },
    stock: { type: "number", minimum: 0 },
    category: {
      type: "string",
      enum: ["ELECTRONICS", "FASHION", "HOME", "SPORTS", "BOOKS", "OTHER"],
    },
    brand: { type: "string", nullable: true },
    tags: { type: "array", items: { type: "string" }, maxItems: 10 },
    keywords: { type: "array", items: { type: "string" }, maxItems: 10 },
    metaTitle: { type: "string", maxLength: 70 },
    metaDescription: { type: "string", maxLength: 160 },
    status: {
      type: "string",
      enum: ["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "DISCONTINUED"],
    },
  },
};

const updateProductDto = {
  type: "object",
  properties: {
    name: { type: "string", maxLength: 200 },
    description: { type: "string" },
    mainImage: {
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
            enum: ["IMAGE", "VIDEO", "DOCUMENT", "OTHER"],
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
    price: { type: "number", minimum: 0 },
    discountPrice: { type: "number", minimum: 0, nullable: true },
    stock: { type: "number", minimum: 0 },
    category: {
      type: "string",
      enum: ["ELECTRONICS", "FASHION", "HOME", "SPORTS", "BOOKS", "OTHER"],
    },
    brand: { type: "string", nullable: true },
    tags: { type: "array", items: { type: "string" }, maxItems: 10 },
    keywords: { type: "array", items: { type: "string" }, maxItems: 10 },
    metaTitle: { type: "string", maxLength: 70 },
    metaDescription: { type: "string", maxLength: 160 },
    status: {
      type: "string",
      enum: ["DRAFT", "PUBLISHED", "OUT_OF_STOCK", "DISCONTINUED"],
    },
  },
};

module.exports = { createProductDto, updateProductDto };
