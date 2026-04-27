import { v2 as cloudinary } from "cloudinary";
import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { AppError } from "../middlewares/errorMiddleware.js";

const uploadToCloudinary = (
  buffer: Buffer,
  folder: string,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" }, // cap resolution
          { quality: "auto:good" }, // auto compress
          { fetch_format: "auto" }, // webp for supported browsers
        ],
      },
      (err, result) => {
        if (err || !result) return reject(err ?? new Error("Upload failed"));
        resolve(result.secure_url);
      },
    );
    stream.end(buffer);
  });
};

export const uploadImages = asyncHandler(
  async (req: Request, res: Response) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) throw new AppError("No files uploaded", 400);

    const urls = await Promise.all(
      files.map((file) => uploadToCloudinary(file.buffer, "products")),
    );

    res.status(200).json({ success: true, urls });
  },
);
