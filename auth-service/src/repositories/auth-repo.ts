import prisma from "../lib/prisma.js";
import { mapPrismaError } from "../lib/prismaError.js";
import type { RegisterUserInputs } from "../types/auth.js";

export class AuthRepository {
  async findByEmail(email: string) {
    return prisma.user.findUnique({ where: { email } });
  }

  async findById(id: string) {
    return prisma.user.findUnique({ where: { id } });
  }

  async create(data: RegisterUserInputs) {
    return prisma.user.create({ data });
  }

  async markAsVerified(email: string) {
    try {
      return await prisma.user.update({
        where: { email },
        data: { isVerified: true },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async deleteRefreshTokens(token: string, id: string) {
    return prisma.refreshToken.deleteMany({ where: { token, id } });
  }

  async deleteByEmail(email: string) {
    try {
      return await prisma.user.delete({
        where: { email },
      });
    } catch (error) {
      mapPrismaError(error);
    }
  }

  async updatePassword(email: string, hashedPassword: string) {
    return prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });
  }

  async deleteAllRefreshTokensByEmail(email: string) {
    return prisma.refreshToken.deleteMany({
      where: { user: { email } },
    });
  }
}

export const authRepository = new AuthRepository();
