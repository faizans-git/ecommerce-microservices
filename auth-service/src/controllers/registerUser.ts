import { validateRegistrationData } from "../requestDataValidators/validateData.js";
import type { RegisterUserInputs } from "../types/auth.js";
import logger from "../utils/logger.js";
import type { Request, Response } from "express";

const registerUser = async (req: Request, res: Response) => {
  logger.info("User registration endpoint hit.");
  try {
    const { error, value } = validateRegistrationData(req.body);
    if (error) {
      logger.warn("Validation error", error);
      return res.status(400).json({
        success: false,
        message: "Input data is not according to schema",
      });
    }
    const { username, email, password }: RegisterUserInputs = value;
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
    });
  } catch (error) {
    logger.error("Error occured while user registration", { error });
    return res.status(500).json({
      success: false,
      message: "An unknnown server error occurred",
    });
  }
};

export default registerUser;
