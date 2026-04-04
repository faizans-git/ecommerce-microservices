import Joi from "joi";

export const addToCartSchema = Joi.object({
  variantId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(1).required(),
});

export const updateQuantitySchema = Joi.object({
  variantId: Joi.string().uuid().required(),
  quantity: Joi.number().integer().min(0).required(),
});
