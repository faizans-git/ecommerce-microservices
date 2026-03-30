import { Request, Response, NextFunction } from "express";
import { AppError } from "./errorMiddleware.js";

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const userId = req.headers["x-user-id"];
  const userRole = req.headers["x-user-role"];

  if (!userId) {
    throw new AppError("Internal Security Breach: User context missing", 401);
  }

  req.user = {
    id: userId as string,
    role: userRole as string,
  };

  next();
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== "admin") {
    throw new AppError("User not allowed access, addmin only endpoint", 401);
  }
  next();
};
