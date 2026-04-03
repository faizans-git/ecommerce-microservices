import { authRepository, AuthRepository } from "../repositories/auth-repo.js";
import { AppError } from "../middlewares/errorHandler.js";
import generateTokens from "../lib/generateToken.js";
import { hashPassword, verifyPassword } from "../utils/password.js";
import { generateOtp, invalidateOtp, verifyOtp } from "../lib/otpFunctions.js";
import { sendOtpEmail } from "../lib/emailService.js";
import type { RegisterUserInputs, LoginUserInputs } from "../types/auth.js";

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

  async logout(refreshToken: string) {
    await this.authRepo.deleteRefreshTokens(refreshToken);
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
}

export const authService = new AuthService(authRepository);
