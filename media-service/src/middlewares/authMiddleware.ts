import { Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { AppError } from "./errorMiddleware.js";
import logger from "../lib/logger.js";

const GATEWAY_SECRET = process.env.GATEWAY_SECRET!;
if (!GATEWAY_SECRET) throw new Error("GATEWAY_SECRET missing");

export const gatewayAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.headers["x-user-id"] as string;
  const email = req.headers["x-user-email"] as string;
  const role = req.headers["x-user-role"] as string;
  const signature = req.headers["x-gateway-signature"] as string;

  if (!userId || !email || !role || !signature) {
    return next(new AppError("Unauthorized", 401));
  }

  const expected = crypto
    .createHmac("sha256", GATEWAY_SECRET)
    .update(`${userId}:${email}:${role}`)
    .digest("hex");

  const valid = crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(signature),
  );

  if (!valid) return next(new AppError("Invalid gateway signature", 401));

  req.user = { userId, email, role };
  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "ADMIN") {
    logger.warn(
      `Unauthorized person tried to access admin only feature user:${req.user?.userId}`,
    );
    return new AppError("Only admins are allowed", 403);
  }
  next();
};
