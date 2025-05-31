// utils/response/responseSchemas.js

// طرح مشترک برای meta
const metaSchema = {
  type: "object",
  properties: {
    has_error: { type: "boolean" },
    message: { type: ["string", "null"] },
    status: { type: "number" },
  },
  required: ["has_error", "message", "status"],
};

// طرح مشترک برای پاسخ‌های موفقیت
const successResponseSchema = {
  type: "object",
  properties: {
    data: { type: ["object", "array", "null"] },
    meta: metaSchema,
  },
  required: ["data", "meta"],
};

// طرح مشترک برای پاسخ‌های خطا
const errorResponseSchema = {
  type: "object",
  properties: {
    data: { type: "null" },
    meta: metaSchema, // اصلاح: metaScheme به metaSchema تغییر یافت
  },
  required: ["data", "meta"],
};

module.exports = { metaSchema, successResponseSchema, errorResponseSchema };
