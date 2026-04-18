import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";
import { Request, Response, NextFunction } from "express";
import redisClient from "../lib/Redis.js";
import logger from "../utils/logger.js";
import { AppError } from "./errorHandler.js";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  prefix: string;
  message?: string;
}

const createKey = (req: Request): string => {
  const userId = req.user?.userId;
  if (userId) return `user:${userId}`;
  const ip = req.ip || req.socket?.remoteAddress || "anonymous";
  return `ip:${ipKeyGenerator(ip)}`;
};

const createHandler =
  (options: RateLimiterOptions) =>
  (req: Request, res: Response, next: NextFunction) => {
    logger.warn("Rate limit exceeded", {
      path: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
    res.setHeader("Retry-After", Math.ceil(options.windowMs / 1000));
    next(
      new AppError(
        options.message || "Too many requests. Try again later.",
        429,
      ),
    );
  };

export const createRateLimiter = (options: RateLimiterOptions) => {
  const redisLimiter = rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    store: new RedisStore({
      sendCommand: async (
        command: string,
        ...args: string[]
      ): Promise<RedisReply> => {
        const result = await redisClient.sendCommand([command, ...args]);
        return result as unknown as RedisReply;
      },
      prefix: `rl:${options.prefix}:`,
    }),
    keyGenerator: createKey,
    handler: createHandler(options),
  });

  const memoryLimiter = rateLimit({
    windowMs: options.windowMs,
    limit: options.max,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    keyGenerator: createKey,
    handler: createHandler(options),
  });

  return (req: Request, res: Response, next: NextFunction) => {
    if (redisClient.isReady) {
      return redisLimiter(req, res, next);
    }
    logger.warn("Redis unavailable, using in-memory rate limiter", {
      path: req.originalUrl,
    });
    return memoryLimiter(req, res, next);
  };
};

export const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  prefix: "limit:auth:login-reg",
  message: "Too many attempts. Try again after 15 minutes.",
});

export const otpLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 3,
  prefix: "limit:auth:otp",
  message: "Too many OTP requests. Try again in a minute.",
});

export const logoutLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 15,
  prefix: "limit:auth:logout",
  message: "Too many logout requests.",
});

export const generalAuthLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  prefix: "limit:auth:general",
  message: "Too many requests. Try again later.",
});

export const passwordResetLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests, try again later",
  prefix: "limit:auth:reset",
});

export const refreshTokenLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: "Too many requests, try again later",
  prefix: "limit:auth:refreshtoken",
});
