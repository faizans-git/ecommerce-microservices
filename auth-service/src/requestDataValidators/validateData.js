import Joi from "joi";

export const validateRegistrationData = (data) => {
  const schema = Joi.object({
    username: Joi.string().min(3).max(9).trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(3).max(9).trim().required(),
  });
  return schema.validate(data);
};

export const loginRegistrationData = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(3).max(9).trim().required(),
  });
  return schema.validate(data);
};
