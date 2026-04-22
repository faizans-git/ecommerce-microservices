import { authRepository, AuthRepository } from "../repositories/auth-repo.js";
import { AppError } from "../middlewares/errorHandler.js";
import generateTokens from "../lib/generateToken.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateOtp, invalidateOtp, verifyOtp } from "../lib/otpFunctions.js";
import { sendOtpEmail, sendPasswordResetEmail } from "../lib/emailService.js";
import type { RegisterUserInputs, LoginUserInputs } from "../types/auth.js";
import {
  generateResetToken,
  verifyResetToken,
} from "../lib/passwordResetToken.js";

export class AuthService {
  constructor(private authRepo: AuthRepository) {}

  async login(data: LoginUserInputs) {
    const user = await this.authRepo.findByEmail(data.email);

    if (!user || !(await verifyPassword(user.password, data.password))) {
      throw new AppError("Invalid credentials", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Please verify your email", 401);
    }

    return generateTokens(user);
  }

  async logout(refreshToken: string, userId: string) {
    await this.authRepo.deleteRefreshTokens(refreshToken, userId);
  }

  async register(data: RegisterUserInputs) {
    const existingUser = await this.authRepo.findByEmail(data.email);

    if (existingUser) {
      throw new AppError("Email already exists", 409);
    }

    const hashedPassword = await hashPassword(data.password);
    const user = await this.authRepo.create({
      username: data.username,
      email: data.email,
      password: hashedPassword,
    });

    try {
      const otp = await generateOtp(data.email);
      await sendOtpEmail(data.email, otp);
    } catch (err) {
      await this.authRepo.deleteByEmail(data.email);
      throw new AppError("Failed to send verification email", 500);
    }
  }

  async verifyOtpCode(email: string, otp: string) {
    const user = await this.authRepo.findByEmail(email);
    if (!user) throw new AppError("Invalid OTP", 400);

    const isValid = await verifyOtp(email, otp);
    if (!isValid) throw new AppError("Invalid OTP", 400);

    const verified = await this.authRepo.markAsVerified(user.email);
    if (!verified) throw new AppError("Verification failed", 500);

    return generateTokens(verified!);
  }

  async resendOtpCode(email: string) {
    const user = await this.authRepo.findByEmail(email);

    if (!user || user.isVerified) {
      throw new AppError("Invalid request", 400);
    }
    await invalidateOtp(email);
    const otp = await generateOtp(email);
    await sendOtpEmail(email, otp);
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.authRepo.findByEmail(email);

    if (!user || !user.isVerified) return;

    const rawToken = await generateResetToken(email);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}&email=${encodeURIComponent(email)}`;

    await sendPasswordResetEmail(email, resetUrl);
  }

  async resetPassword(
    email: string,
    token: string,
    newPassword: string,
  ): Promise<void> {
    const isValid = await verifyResetToken(email, token);
    if (!isValid) throw new AppError("Invalid or expired reset link", 400);

    const user = await this.authRepo.findByEmail(email);
    if (!user) throw new AppError("Invalid or expired reset link", 400);

    const isSamePassword = await verifyPassword(user.password, newPassword);
    if (isSamePassword) {
      throw new AppError("New password must differ from the current one", 400);
    }

    const hashedPassword = await hashPassword(newPassword);
    await this.authRepo.updatePassword(email, hashedPassword);

    await this.authRepo.deleteAllRefreshTokensById(user.id);
  }
  async renewTokens(token: string) {
    const dbToken = await this.authRepo.getRefreshTokenByToken(token);

    if (!dbToken) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    if (dbToken.expiresAt < new Date()) {
      await this.authRepo.deleteRefreshToken(dbToken.id);
      throw new AppError("Session expired, please log in again", 401);
    }

    const user = await this.authRepo.findById(dbToken.userId);

    if (!user) {
      throw new AppError("User no longer exists", 401);
    }

    if (!user.isVerified) {
      throw new AppError("Account not verified", 403);
    }

    await this.authRepo.deleteRefreshToken(dbToken.id);

    return generateTokens(user);
  }
}

export const authService = new AuthService(authRepository);
