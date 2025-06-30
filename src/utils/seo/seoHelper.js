const buildSeoAttributes = (
  entity = null,
  entityType = "category",
  isList = false
) => {
  const baseUrl = process.env.BASE_URL || "https://yourwebsite.com"; // استفاده از متغیر محیطی
  const defaultAttributes = {
    metaTitle: "صفحه اصلی | نام وب‌سایت",
    metaDescription:
      "به وب‌سایت ما خوش آمدید! محصولات و خدمات ما را کاوش کنید.",
    canonicalUrl: `${baseUrl}/`,
    ogTitle: "صفحه اصلی | نام وب‌سایت",
    ogDescription: "به وب‌سایت ما خوش آمدید! محصولات و خدمات ما را کاوش کنید.",
    ogImage: `${baseUrl}/images/default-og-image.jpg`,
    keywords: ["وب‌سایت", "فروشگاه", "خدمات"],
  };

  // اتریبیوت‌های پیش‌فرض برای لیست‌ها
  const listAttributes = {
    category: {
      metaTitle: "همه دسته‌بندی‌های محصولات | نام وب‌سایت",
      metaDescription:
        "انواع دسته‌بندی‌های محصولات ما را با توضیحات کامل و جزئیات کاوش کنید.",
      canonicalUrl: `${baseUrl}/categories`,
      ogTitle: "همه دسته‌بندی‌های محصولات | نام وب‌سایت",
      ogDescription:
        "انواع دسته‌بندی‌های محصولات ما را با توضیحات کامل و جزئیات کاوش کنید.",
      ogImage: `${baseUrl}/images/category-list-og-image.jpg`,
      keywords: ["دسته‌بندی محصولات", "فروشگاه آنلاین", "خرید", "محصولات"],
    },
    product: {
      metaTitle: "لیست محصولات | نام وب‌سایت",
      metaDescription: "جدیدترین محصولات ما را با قیمت‌های مناسب مشاهده کنید.",
      canonicalUrl: `${baseUrl}/products`,
      ogTitle: "لیست محصولات | نام وب‌سایت",
      ogDescription: "جدیدترین محصولات ما را با قیمت‌های مناسب مشاهده کنید.",
      ogImage: `${baseUrl}/images/product-list-og-image.jpg`,
      keywords: ["محصولات", "فروشگاه", "خرید"],
    },
    page: {
      metaTitle: "صفحات وب‌سایت | نام وب‌سایت",
      metaDescription: "تمامی صفحات اطلاعاتی و خدمات وب‌سایت ما را کاوش کنید.",
      canonicalUrl: `${baseUrl}/pages`,
      ogTitle: "صفحات وب‌سایت | نام وب‌سایت",
      ogDescription: "تمامی صفحات اطلاعاتی و خدمات وب‌سایت ما را کاوش کنید.",
      ogImage: `${baseUrl}/images/page-list-og-image.jpg`,
      keywords: ["صفحات", "اطلاعات", "خدمات"],
    },
  };

  // اگر درخواست برای لیست باشد
  if (isList) {
    return listAttributes[entityType] || defaultAttributes;
  }

  // اگر موجودیت مشخص شده باشد
  if (entity) {
    switch (entityType) {
      case "category":
        return {
          metaTitle:
            entity.metaTitle ||
            entity.name?.substring(0, 70) ||
            defaultAttributes.metaTitle,
          metaDescription:
            entity.metaDescription ||
            entity.description?.substring(0, 160) ||
            `کاوش محصولات در دسته‌بندی ${entity.name} با بهترین کیفیت و قیمت.`,
          canonicalUrl: `${baseUrl}/category/${entity.slug}`,
          ogTitle:
            entity.metaTitle ||
            entity.name?.substring(0, 70) ||
            defaultAttributes.ogTitle,
          ogDescription:
            entity.metaDescription ||
            entity.description?.substring(0, 160) ||
            `کاوش محصولات در دسته‌بندی ${entity.name} با بهترین کیفیت و قیمت.`,
          ogImage:
            entity.ogImage ||
            entity.image ||
            `${baseUrl}/images/default-category-og-image.jpg`,
          keywords: entity.metaKeywords || [
            entity.name,
            "دسته‌بندی",
            "فروشگاه آنلاین",
            "خرید",
          ],
        };
      case "product":
        return {
          metaTitle:
            entity.metaTitle ||
            entity.name?.substring(0, 70) ||
            defaultAttributes.metaTitle,
          metaDescription:
            entity.metaDescription ||
            entity.description?.substring(0, 160) ||
            defaultAttributes.metaDescription,
          canonicalUrl: `${baseUrl}/product/${entity.slug}`,
          ogTitle:
            entity.metaTitle ||
            entity.name?.substring(0, 70) ||
            defaultAttributes.ogTitle,
          ogDescription:
            entity.metaDescription ||
            entity.description?.substring(0, 160) ||
            defaultAttributes.ogDescription,
          ogImage: entity.ogImage || entity.image || defaultAttributes.ogImage,
          keywords: entity.metaKeywords || [entity.name, "محصول", "فروشگاه"],
        };
      case "page":
        return {
          metaTitle:
            entity.metaTitle ||
            entity.title?.substring(0, 70) ||
            defaultAttributes.metaTitle,
          metaDescription:
            entity.metaDescription ||
            entity.content?.substring(0, 160) ||
            defaultAttributes.metaDescription,
          canonicalUrl: `${baseUrl}/page/${entity.slug}`,
          ogTitle:
            entity.metaTitle ||
            entity.title?.substring(0, 70) ||
            defaultAttributes.ogTitle,
          ogDescription:
            entity.metaDescription ||
            entity.content?.substring(0, 160) ||
            defaultAttributes.ogDescription,
          ogImage: entity.ogImage || entity.image || defaultAttributes.ogImage,
          keywords: entity.metaKeywords || [
            entity.metaKeywords,
            "page",
            "اطلاعات",
          ],
        };
      default:
        return null;
    }
  }

  return defaultAttributes; // پیش‌فرض در صورت عدم وجود موجودیت
};

module.exports = { buildSeoAttributes };
