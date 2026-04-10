import Joi from "joi";

export const createOrderSchema = Joi.object({
  items: Joi.array()
    .items(
      Joi.object({
        variantId: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).max(90).required(),
      }),
    )
    .min(1)
    .required(),
  shippingAddress: Joi.object({
    street: Joi.string().required(),
    city: Joi.string().required(),
    country: Joi.string().required(),
    zip: Joi.string().required(),
  }).required(),
});

export const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid("PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED")
    .required(),
});
