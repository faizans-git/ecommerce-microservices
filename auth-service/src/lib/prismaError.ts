import { Prisma } from "../generated/client.js";
import { AppError } from "../middlewares/errorHandler.js";

export function mapPrismaError(err: unknown): AppError {
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        return new AppError("Duplicate field value", 409);
      case "P2025":
        return new AppError("Record not found", 404);
      default:
        return new AppError("Database constraint error", 500);
    }
  }

  return new AppError("Unexpected database error", 500);
}
