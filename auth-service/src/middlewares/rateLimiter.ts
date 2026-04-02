import rateLimit from "express-rate-limit";
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

const createKey = (req: Request) => {
  return `ip:${req.ip}`;
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

export const generalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  prefix: "general",
});

export const productReadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 60,
  prefix: "limit:product:read",
  message: "Too many read requests. Try again later.",
});

export const productWriteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  prefix: "limit:product:write",
  message: "Too many write requests. Try again later.",
});

export const productMutateLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  prefix: "limit:product:mutate",
  message: "Too many requests. Try again later.",
});

export const productDeleteLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 30,
  prefix: "limit:product:delete",
  message: "Too many delete requests. Try again later.",
});
