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

  async deleteRefreshTokens(token: string) {
    return prisma.refreshToken.deleteMany({ where: { token } });
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
}

export const authRepository = new AuthRepository();
