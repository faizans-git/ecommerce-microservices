import { Request, Response, NextFunction } from "express";
import jwt, { TokenExpiredError, JsonWebTokenError } from "jsonwebtoken";
import { AppError } from "./errorHandler.js";
import { TokenPayload } from "../lib/generateToken.js";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer ")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("Authentication required", 401));
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      throw new Error("JWT_SECRET is missing");
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
    req.user = decoded;

    next();
  } catch (error) {
    if (error instanceof TokenExpiredError) {
      return next(new AppError("Token expired", 401));
    }

    if (error instanceof JsonWebTokenError) {
      return next(new AppError("Invalid token", 401));
    }

    return next(error);
  }
};
