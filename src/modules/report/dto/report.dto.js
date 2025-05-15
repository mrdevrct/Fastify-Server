const { z } = require("zod");

const createReportDto = z.object({
  reportedUserId: z.string().nonempty(),
  reason: z.string().min(5).nonempty(),
});

module.exports = { createReportDto };
