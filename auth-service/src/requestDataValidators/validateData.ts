import Joi from "joi";
import type { RegisterUserInputs } from "../types/auth.js";

const registrationSchema = Joi.object({
  username: Joi.string().min(3).max(20).trim().required(),
  email: Joi.string().email().trim().required(),
  password: Joi.string().min(8).max(120).required(),
});

export const validateRegistrationData = (data: RegisterUserInputs) => {
  return registrationSchema.validate(data);
};

// export const loginRegistrationData = (data) => {
//   const schema = Joi.object({
//     email: Joi.string().email().trim().required(),
//     password: Joi.string().min(3).max(9).trim().required(),
//   });
//   return schema.validate(data);
// };
