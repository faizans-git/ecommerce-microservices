import { validateRegistrationData } from "../requestDataValidators/validateData.js";
import type { RegisterUserInputs } from "../types/auth.js";
import logger from "../utils/logger.js";
import type { Request, Response } from "express";
import { hashPassword } from "../utils/password.js";
import prisma from "../lib/prisma.js";
import generateTokens from "../lib/generateToken.js";
import findUser from "../lib/checkExistance.js";

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

    const userExists = await findUser(email);
    if (userExists) {
      logger.error(`User with these credentials already exists: ${email}`);

      return res
        .status(409)
        .json({ success: false, message: "Email already in use" });
    }

    const hashedPassword: string = await hashPassword(password);

    const createUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    const token = generateTokens(createUser);

    if (!createUser) {
      logger.error("Error during user registration");
      return res.status(500).json({
        success: false,
        message: "Internal error occurred. Please try again later",
      });
    }

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
