import crypto from "crypto";

const GATEWAY_SECRET = process.env.GATEWAY_SECRET!;
if (!GATEWAY_SECRET) throw new Error("GATEWAY_SECRET missing");

export const signUserHeaders = (
  userId: string,
  email: string,
  role: string,
): string => {
  const payload = `${userId}:${email}:${role}`;
  return crypto
    .createHmac("sha256", GATEWAY_SECRET)
    .update(payload)
    .digest("hex");
};

export const verifyUserHeaders = (
  userId: string,
  email: string,
  role: string,
  signature: string,
): boolean => {
  const expected = signUserHeaders(userId, email, role);
  return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
};
