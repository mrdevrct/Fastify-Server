const { z } = require("zod");

const authDto = z.object({
  email: z.string().email().nonempty(),
});

const verifyCodeDto = z.object({
  email: z.string().email().nonempty(),
  code: z.string().length(6),
});

const loginWithPasswordDto = z.object({
  email: z.string().email().nonempty(),
  password: z.string().min(6).nonempty(),
});

const updateProfileDto = z.object({
  lastName: z.string().min(1).optional(),
  firstName: z.string().min(1).optional(),
  password: z.string().min(6).optional(),
  profilePath: z.string().optional(),
});

const updateFeatureAccessDto = z.array(
  z.object({
    id: z.number(),
    feature: z.string().nonempty(),
    access: z.enum(["FULL_ACCESS", "READ_ONLY", "NO_ACCESS"]),
  })
);

const refreshTokenDto = z.object({
  refreshToken: z.string().nonempty(),
});

module.exports = {
  authDto,
  verifyCodeDto,
  loginWithPasswordDto,
  updateProfileDto,
  updateFeatureAccessDto,
  refreshTokenDto,
};
