import { Router } from "express";
import { AuthController } from "../controllers/auth-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";

import {
  authLimiter,
  logoutLimiter,
  otpLimiter,
} from "../middlewares/rateLimiter.js";
import {
  loginSchema,
  logoutSchema,
  registerSchema,
  resendOtpSchema,
  verifyOtpSchema,
} from "../requestDataValidators/validateData.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
const controller = new AuthController();

router.post(
  "/register",
  authLimiter,
  validate(registerSchema),
  controller.registerUser,
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

router.post("/login", authLimiter, validate(loginSchema), controller.loginUser);

router.post(
  "/logout",
  authMiddleware,
  logoutLimiter,
  validate(logoutSchema),
  controller.logoutUser,
);

export default router;
