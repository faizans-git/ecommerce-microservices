import Joi from "joi";

export const createProductSchema = Joi.object({
  name: Joi.string().trim().min(3).max(255).required(),

  description: Joi.string().optional(),

  slug: Joi.string().trim().lowercase().required(),

  basePrice: Joi.number().positive().required(),

  categoryId: Joi.string().uuid().optional(),

  variants: Joi.array()
    .items(
      Joi.object({
        sku: Joi.string().trim().required(),
        price: Joi.number().positive().required(),
        stock: Joi.number().integer().min(0).required(),

        attributes: Joi.array()
          .items(
            Joi.object({
              name: Joi.string().required(),
              value: Joi.string().required(),
            }),
          )
          .optional(),
      }),
    )
    .min(1)
    .required(),

  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().optional(),
        sortOrder: Joi.number().integer().min(0).optional(),
      }),
    )
    .optional(),
});

export const getAllProductsSchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),

  sortBy: Joi.string()
    .valid("createdAt", "basePrice", "name")
    .default("createdAt"),

  order: Joi.string().valid("asc", "desc").default("desc"),
});

export const updateProductSchema = Joi.object({
  name: Joi.string().min(1).optional(),
  description: Joi.string().optional(),
  slug: Joi.string().min(1).optional(),
  basePrice: Joi.number().positive().optional(),
  categoryId: Joi.string().optional(),
  images: Joi.array()
    .items(
      Joi.object({
        url: Joi.string().uri().required(),
        altText: Joi.string().optional(),
        sortOrder: Joi.number().optional(),
      }),
    )
    .optional(),
});

export const getVariantsBatchSchema = Joi.object({
  variantIds: Joi.array()
    .items(Joi.string().trim().required())
    .min(1)
    .max(100)
    .required(),
});

export const reserveStockSchema = Joi.object({
  variantId: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const releaseStockSchema = Joi.object({
  variantId: Joi.string().trim().required(),
  quantity: Joi.number().integer().min(1).required(),
});
