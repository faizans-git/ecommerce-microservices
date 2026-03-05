import Joi from "joi";
const registrationSchema = Joi.object({
    username: Joi.string().min(3).max(20).trim().required(),
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(8).max(120).required(),
});
export const validateRegistrationData = (data) => {
    return registrationSchema.validate(data);
};
const loginSchema = Joi.object({
    email: Joi.string().email().trim().required(),
    password: Joi.string().min(8).max(120).required(),
});
export const validateLoginData = (data) => {
    return loginSchema.validate(data);
};
//# sourceMappingURL=validateData.js.map