const categoryJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string", description: "Category MongoDB ID" },
    name: { type: "string", description: "Category name", maxLength: 100 },
    slug: { type: "string", description: "Unique category slug" },
    parentId: {
      type: "string",
      nullable: true,
      description: "Parent category ID",
    },
    description: { type: "string", description: "Category description" },
    image: { type: "string", description: "URL to category image" },
    metaTitle: { type: "string", description: "SEO meta title", maxLength: 70 },
    metaDescription: {
      type: "string",
      description: "SEO meta description",
      maxLength: 160,
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Category creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Category update timestamp",
    },
  },
  required: ["name", "slug"],
};

module.exports = { categoryJsonSchema };
