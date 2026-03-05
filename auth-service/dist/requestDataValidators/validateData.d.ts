import Joi from "joi";
import type { RegisterUserInputs, LoginUserInputs } from "../types/auth.js";
export declare const validateRegistrationData: (data: RegisterUserInputs) => Joi.ValidationResult<any>;
export declare const validateLoginData: (data: LoginUserInputs) => Joi.ValidationResult<any>;
