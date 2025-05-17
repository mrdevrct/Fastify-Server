const { z } = require("zod");

const createReportDto = z.object({
  reportedUserId: z.string().nonempty(),
  reason: z.string().min(5).nonempty(),
});

const clearReportsOfUserParamsDto = z.object({
  id: z.string().nonempty(),
});

const deleteSingleReportParamsDto = z.object({
  reportId: z.string().nonempty(),
});

const banUnbanUserParamsDto = z.object({
  id: z.string().nonempty(),
});

module.exports = {
  createReportDto,
  clearReportsOfUserParamsDto,
  deleteSingleReportParamsDto,
  banUnbanUserParamsDto,
};
