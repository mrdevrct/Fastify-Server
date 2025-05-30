const siteStatusJsonSchema = {
  type: "object",
  properties: {
    _id: { type: "string", description: "Site status MongoDB ID" },
    status: {
      type: "string",
      enum: ["OPERATIONAL", "MAINTENANCE", "BUG", "SERVER_ISSUE", "DOWN"],
      description: "Current site status",
    },
    message: { type: "string", description: "Status message or description" },
    expectedResolutionTime: {
      type: "string",
      format: "date-time",
      description: "Expected resolution time for issues",
      nullable: true,
    },
    updatedBy: {
      type: "string",
      description: "ID of the user who updated the status",
    },
    createdAt: {
      type: "string",
      format: "date-time",
      description: "Status creation timestamp",
    },
    updatedAt: {
      type: "string",
      format: "date-time",
      description: "Status update timestamp",
    },
  },
  required: ["status", "updatedBy"],
};

module.exports = { siteStatusJsonSchema };
