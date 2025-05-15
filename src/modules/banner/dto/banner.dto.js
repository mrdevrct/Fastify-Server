const { z } = require("zod");

const createBannerDto = z.object({
  imageSrc: z.string().url().nonempty(),
  imageAlt: z.string().min(1).nonempty(),
  title: z.string().min(1).nonempty(),
  subtitle: z.string().min(1).nonempty(),
  link: z.string().url().nonempty(),
  isDiscount: z.boolean().optional().default(false),
  expirationDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Invalid date format",
  }),
});

const updateBannerDto = z.object({
  imageSrc: z.string().url().nonempty().optional(),
  imageAlt: z.string().min(1).nonempty().optional(),
  title: z.string().min(1).nonempty().optional(),
  subtitle: z.string().min(1).nonempty().optional(),
  link: z.string().url().nonempty().optional(),
  isDiscount: z.boolean().optional(),
  expirationDate: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "Invalid date format",
    })
    .optional(),
});

module.exports = { createBannerDto, updateBannerDto };
