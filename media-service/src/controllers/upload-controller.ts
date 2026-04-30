import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { uploadBuffer } from "../services/cloudinary-service.js";

export const uploadImages = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];

    if (!files?.length) {
      throw new AppError("No files provided", 400);
    }

    const uploads = await Promise.allSettled(
      files.map((file) => uploadBuffer(file.buffer, "products")),
    );

    const urls: string[] = [];
    const failed: number[] = [];

    uploads.forEach((r, idx) => {
      if (r.status === "fulfilled") urls.push(r.value);
      else failed.push(idx);
    });

    res.status(200).json({
      success: true,
      uploaded: urls,
      failedCount: failed.length,
    });
  },
);
