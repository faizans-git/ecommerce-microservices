import { validateLoginData } from "../requestDataValidators/validateData.js";
import { LoginUserInputs } from "../types/auth.js";
import logger from "../utils/logger.js";
import type { Request, Response } from "express";
import { verifyPassword } from "../utils/password.js";
import generateTokens from "../lib/generateToken.js";
import findUser from "../lib/checkExistance.js";

const loginUser = async (req: Request, res: Response) => {
  try {
    const { value, error } = validateLoginData(req.body);

    if (error) {
      logger.warn(`user login input is not according to schema ${error}`);
      return res.status(400).json({
        success: false,
        message: "Input data is not according to schema",
      });
    }

    const { email, password } = value;

    const user = await findUser(email);

    if (!user) {
      logger.error(`user with these credentials does not exist: ${email}`);

      return res
        .status(403)
        .json({ success: false, message: "Invalid credentials" });
    }

    if (!user.isVerified) {
      logger.error(`user with these credentials is not verified : ${email}`);

      return res
        .status(401)
        .json({ success: false, message: "Please verify your email first" });
    }

    const passwordVerified = await verifyPassword(user.password, password);

    if (!passwordVerified) {
      logger.error(`Wrong credentials for: ${email}`);

      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    const { jwtToken, refreshToken } = await generateTokens(user);

    return res.status(200).json({
      success: true,
      message: "Successfully logged in.",
      jwtToken,
      refreshToken,
    });
  } catch (error) {
    logger.error("Error occured while user login", { error });
    return res.status(500).json({
      success: false,
      message: "An unknown server error occurred. Please try again later.",
    });
  }
};

export default loginUser;
