import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authService } from "../services/auth-service.js";

export class AuthController {
  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.login(req.body);
    res.status(200).json({ success: true, ...tokens });
  });

  logoutUser = asyncHandler(async (req: Request, res: Response) => {
    await authService.logout(req.body.refreshToken);
    res.status(200).json({ success: true, message: "Logged out" });
  });

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    await authService.register(req.body);
    res.status(201).json({ success: true, message: "User registered" });
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.verifyOtpCode(
      req.body.email,
      req.body.otp,
    );
    res.status(200).json({ success: true, ...tokens });
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    await authService.resendOtpCode(req.body.email);
    res.status(200).json({ success: true, message: "OTP resent" });
  });
}

export const authController = new AuthController();
