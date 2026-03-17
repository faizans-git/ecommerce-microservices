import crypto from "crypto";
import { redisClient } from "./Redis.js";
const MAX_ATTEMPTS = 5;
const OTP_EXPIRY_SECONDS = 300;
export const generateOtp = async (userId) => {
    const otp = crypto.randomInt(100000, 1000000).toString();
    await redisClient.set(`otp:${userId}`, otp, {
        EX: OTP_EXPIRY_SECONDS,
    });
    return otp;
};
export const verifyOtp = async (userId, code) => {
    const key = `otp:${userId}`;
    const attemptKey = `otp_attempts:${userId}`;
    const attempts = await redisClient.incr(attemptKey);
    if (attempts === 1) {
        await redisClient.expire(attemptKey, OTP_EXPIRY_SECONDS);
    }
    const recordedOtp = await redisClient.get(key);
    if (attempts > MAX_ATTEMPTS) {
        await Promise.all([redisClient.del(key), redisClient.del(attemptKey)]);
        return false;
    }
    if (recordedOtp !== code) {
        return false;
    }
    await Promise.all([redisClient.del(key), redisClient.del(attemptKey)]);
    return true;
};
//# sourceMappingURL=otpFunctions.js.map