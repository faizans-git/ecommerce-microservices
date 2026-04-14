import crypto from "crypto";
import redisClient from "./Redis.js";

const RESET_TOKEN_EXPIRY_SECONDS = 900; // 15 minutes
const MAX_VERIFY_ATTEMPTS = 3;

export const generateResetToken = async (email: string): Promise<string> => {
  await invalidateResetToken(email);

  const rawToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  await redisClient.set(`pwd_reset:${email}`, hashedToken, {
    EX: RESET_TOKEN_EXPIRY_SECONDS,
  });

  return rawToken;
};

export const verifyResetToken = async (
  email: string,
  rawToken: string,
): Promise<boolean> => {
  const key = `pwd_reset:${email}`;
  const attemptKey = `pwd_reset_attempts:${email}`;

  const storedHash = await redisClient.get(key);
  if (!storedHash) return false;

  const attempts = await redisClient.incr(attemptKey);
  if (attempts === 1) {
    await redisClient.expire(attemptKey, RESET_TOKEN_EXPIRY_SECONDS);
  }

  if (attempts > MAX_VERIFY_ATTEMPTS) {
    await invalidateResetToken(email);
    return false;
  }

  const incomingHash = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  const storedBuffer = Buffer.from(storedHash);
  const incomingBuffer = Buffer.from(incomingHash);

  if (storedBuffer.length !== incomingBuffer.length) return false;

  const isMatch = crypto.timingSafeEqual(storedBuffer, incomingBuffer);

  if (isMatch) {
    await invalidateResetToken(email);
  }

  return isMatch;
};

export const invalidateResetToken = async (email: string): Promise<void> => {
  await Promise.all([
    redisClient.del(`pwd_reset:${email}`),
    redisClient.del(`pwd_reset_attempts:${email}`),
  ]);
};
