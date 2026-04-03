import crypto from "crypto";
import redisClient from "./Redis.js";

const MAX_ATTEMPTS = 5;
const OTP_EXPIRY_SECONDS = 300;

export const generateOtp = async (email: string): Promise<string> => {
  const otp = crypto.randomInt(100000, 1000000).toString();

  await redisClient.set(`otp:${email}`, otp, {
    EX: OTP_EXPIRY_SECONDS,
  });

  return otp;
};

export const verifyOtp = async (
  email: string,
  code: string,
): Promise<boolean> => {
  const key = `otp:${email}`;
  const attemptKey = `otp_attempts:${email}`;

  const recordedOtp = await redisClient.get(key);
  if (!recordedOtp) {
    return false;
  }

  const attempts = await redisClient.incr(attemptKey);
  if (attempts === 1) {
    await redisClient.expire(attemptKey, OTP_EXPIRY_SECONDS);
  }

  if (attempts > MAX_ATTEMPTS) {
    await Promise.all([redisClient.del(key), redisClient.del(attemptKey)]);
    return false;
  }

  const recordedBuffer = Buffer.from(recordedOtp);
  const inputBuffer = Buffer.from(code);

  if (recordedBuffer.length !== inputBuffer.length) {
    return false;
  }

  const isMatch = crypto.timingSafeEqual(recordedBuffer, inputBuffer);

  if (!isMatch) {
    return false;
  }

  await Promise.all([redisClient.del(key), redisClient.del(attemptKey)]);
  return true;
};

export const invalidateOtp = async (email: string): Promise<void> => {
  await Promise.all([
    redisClient.del(`otp:${email}`),
    redisClient.del(`otp_attempts:${email}`),
  ]);
};
