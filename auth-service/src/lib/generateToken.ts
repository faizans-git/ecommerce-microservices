import jwt from "jsonwebtoken";
import { User, Role } from "../generated/client.js";
import logger from "../utils/logger.js";
import prisma from "./prisma.js";
import crypto from "crypto";

export interface TokenPayload {
  userId: string;
  username: string;
  role: Role;
}
export interface AuthTokens {
  jwtToken: string;
  refreshToken: string;
}

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not defined in environment variables");
}

const generateTokens = async (user: User): Promise<AuthTokens> => {
  const payload: TokenPayload = {
    userId: user.id,
    username: user.username,
    role: user.role,
  };

  const jwtToken = jwt.sign(payload, JWT_SECRET, {
    expiresIn: "15m",
  });

  try {
    const refreshToken = crypto.randomBytes(64).toString("hex");

    const refreshTokenExpiry = new Date();
    refreshTokenExpiry.setDate(refreshTokenExpiry.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt: refreshTokenExpiry,
      },
    });

    logger.info(`Tokens generated for user ${user.id}`);

    return { jwtToken, refreshToken };
  } catch (error) {
    logger.error(error);
    throw new Error("Error occurred during token generation.");
  }
};

export default generateTokens;
