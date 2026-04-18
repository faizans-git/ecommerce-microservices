import type { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { authService } from "../services/auth-service.js";
import logger from "../utils/logger.js";

export class AuthController {
  loginUser = asyncHandler(async (req: Request, res: Response) => {
    const tokens = await authService.login(req.body);
    res.status(200).json({ success: true, ...tokens });
  });

  logoutUser = asyncHandler(async (req: Request, res: Response) => {
    const { userId } = req.user!;
    const { refreshToken } = req.body;

    await authService.logout(refreshToken, userId);
    res.status(200).json({ success: true, message: "Logged out" });
  });

  registerUser = asyncHandler(async (req: Request, res: Response) => {
    await authService.register(req.body);
    res.status(201).json({ success: true, message: "User registered" });
  });

  verifyOtp = asyncHandler(async (req: Request, res: Response) => {
    const { jwtToken, refreshToken } = await authService.verifyOtpCode(
      req.body.email,
      req.body.otp,
    );

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "prod",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      accessToken: jwtToken,
    });
  });

  resendOtp = asyncHandler(async (req: Request, res: Response) => {
    await authService.resendOtpCode(req.body.email);
    res.status(200).json({ success: true, message: "OTP resent" });
  });

  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    await authService.forgotPassword(req.body.email);
    res.status(200).json({
      success: true,
      message: "If that email is registered, a reset link has been sent",
    });
  });

  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, token, newPassword } = req.body;
    await authService.resetPassword(email, token, newPassword);
    res
      .status(200)
      .json({ success: true, message: "Password reset successful" });
  });
}

export const controller = new AuthController();
