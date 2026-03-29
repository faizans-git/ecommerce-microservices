// In your rate limiter file
import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../lib/db/redis.js";

export const apiRateLimiter = rateLimit({
  windowMs: 10 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisStore({
    // This will now work perfectly
    sendCommand: (...args: string[]) => redisClient.sendCommand(args),
  }),
  keyGenerator: (req) => {
    return req.ip ?? "unknown-ip";
  },
  handler: (_req, res) => {
    res.status(429).json({
      message: "Too many requests, try again later",
    });
  },
});
