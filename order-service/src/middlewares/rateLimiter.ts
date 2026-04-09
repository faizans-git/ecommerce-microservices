import rateLimit from "express-rate-limit";
import { RedisStore, RedisReply } from "rate-limit-redis";
import { Request, Response, NextFunction } from "express";
import redisClient from "../lib/db/redis.js";
import logger from "../lib/logger.js";
import { AppError } from "./errorMiddleware.js";

interface RateLimiterOptions {
  windowMs: number;
  max: number;
  prefix: string;
  message?: string;
}

const createKey = (req: Request) => {
  const userId = req.user?.userId;
  return userId ? `user:${userId}` : `ip:${req.ip}`;
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

export const orderReadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  prefix: "order",
});

export const orderWriteLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 20,
  prefix: "order",
});

export const orderMutatationLimiter = createRateLimiter({
  windowMs: 10 * 60 * 1000,
  max: 15,
  prefix: "order",
});
