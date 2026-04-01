import type { Request, Response } from "express";
import logger from "../utils/logger.js";
import prisma from "../lib/prisma.js";

const logoutUser = async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    await prisma.refreshToken.deleteMany({
      where: {
        token: refreshToken,
      },
    });

    return res.status(200).json({
      success: true,
      meessage: "User logged out successfully",
    });
  } catch (error) {
    logger.error("Error occured while user logout", { error });
    return res.status(500).json({
      success: false,
      message: "An unknnown server error occurred.Please try again later.",
    });
  }
};

export default logoutUser;
