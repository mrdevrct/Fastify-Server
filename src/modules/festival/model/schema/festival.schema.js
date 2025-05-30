const festivalJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string", description: "Festival MongoDB ID" },
    title: { type: "string", description: "Festival title" },
    slug: { type: "string", description: "Unique festival slug" },
    description: { type: "string", description: "Festival description" },
    bannerImage: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL of the banner image" },
        uploadedBy: {
          type: "string",
          description: "ID of the user who uploaded the image",
        },
      },
      description: "Banner image details",
    },
    discountPercentage: {
      type: "number",
      description: "Discount percentage for the festival",
    },
    startDate: {
      type: "string",
      format: "date-time",
      description: "Festival start date",
    },
    endDate: {
      type: "string",
      format: "date-time",
      description: "Festival end date",
    },
    products: {
      type: "array",
      items: { type: "string" },
      description: "List of product IDs associated with the festival",
    },
    category: { type: "string", description: "Festival category (e.g., ALL)" },
    metaTitle: {
      type: "string",
      description: "SEO meta title",
      nullable: true,
    },
    metaDescription: {
      type: "string",
      description: "SEO meta description",
      nullable: true,
    },
    status: {
      type: "string",
      enum: ["ACTIVE", "INACTIVE"],
      description: "Festival status",
      default: "INACTIVE",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Festival creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Festival update timestamp",
    },
  },
  required: [
    "title",
    "slug",
    "description",
    "bannerImage",
    "discountPercentage",
    "startDate",
    "endDate",
    "category",
    "status",
    "createdAt",
    "updatedAt",
  ],
};

module.exports = { festivalJsonSchema };
