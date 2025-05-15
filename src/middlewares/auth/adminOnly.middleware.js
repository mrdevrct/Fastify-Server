const { userService } = require("../../modules/user/service/user.service");

const adminOnlyMiddleware = async (request, reply) => {
  const user = await userService.findById(request.user.id);
  if (
    user.userType !== "ADMIN" ||
    !["ADMIN", "SUPER_ADMIN"].includes(user.adminStatus)
  ) {
    return reply.code(403).send({ error: "Access denied: Admin only" });
  }
};

module.exports = adminOnlyMiddleware;
