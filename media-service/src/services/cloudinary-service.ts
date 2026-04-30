import cloudinary from "../config/cloudinary.js";

export function uploadBuffer(buffer: Buffer, folder: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
        transformation: [
          { width: 1200, crop: "limit" },
          { quality: "auto:good" },
          { fetch_format: "auto" },
        ],
      },
      (err, result) => {
        if (err || !result) return reject(err || new Error("Upload failed"));
        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
}
