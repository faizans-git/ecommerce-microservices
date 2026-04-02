import { Router } from "express";
import { AuthController } from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  resendOtpSchema,
  logoutSchema,
} from "../validators/authValidator.js";
import {
  authLimiter,
  otpLimiter,
  generalLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();
const controller = new AuthController();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  controller.register,
);

router.post(
  "/resend-otp",
  otpLimiter,
  validate(resendOtpSchema),
  controller.resendOtp,
);

router.post(
  "/verify-otp",
  otpLimiter,
  validate(verifyOtpSchema),
  controller.verifyOtp,
);

router.post("/login", authLimiter, validate(loginSchema), controller.login);

router.post(
  "/logout",
  generalLimiter,
  validate(logoutSchema),
  controller.logout,
);

export default router;
