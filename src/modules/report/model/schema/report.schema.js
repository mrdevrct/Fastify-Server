const reportJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string", description: "Report MongoDB ID" },
    reporter: {
      type: "string",
      description: "ID of the user who submitted the report",
    },
    reportedUser: { type: "string", description: "ID of the reported user" },
    reason: { type: "string", description: "Reason for the report" },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Report creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Report update timestamp",
    },
  },
  required: ["reporter", "reportedUser", "reason", "createdAt", "updatedAt"],
};

const reportedUserJsonSchema = {
  type: "object",
  properties: {
    id: { type: "string", description: "User MongoDB ID" },
    email: { type: "string", description: "User email" },
    username: { type: "string", description: "User username" },
    reportCount: {
      type: "integer",
      description: "Number of reports against the user",
    },
    isBanned: { type: "boolean", description: "Whether the user is banned" },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "User creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "User update timestamp",
    },
  },
  required: [
    "id",
    "email",
    "username",
    "reportCount",
    "isBanned",
    "createdAt",
    "updatedAt",
  ],
};

const paginationJsonSchema = {
  type: "object",
  properties: {
    total: { type: "integer", description: "Total number of items" },
    totalPages: { type: "integer", description: "Total number of pages" },
    currentPage: { type: "integer", description: "Current page number" },
    perPage: { type: "integer", description: "Items per page" },
  },
};

const createReportBodySchema = {
  type: "object",
  properties: {
    reportedUserId: {
      type: "string",
      description: "ID of the user being reported",
    },
    reason: { type: "string", description: "Reason for the report" },
  },
  required: ["reportedUserId", "reason"],
};

module.exports = {
  reportJsonSchema,
  reportedUserJsonSchema,
  paginationJsonSchema,
  createReportBodySchema,
};
