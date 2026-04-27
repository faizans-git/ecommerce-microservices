import { Router } from "express";
import multer from "multer";
import { uploadImages } from "../controllers/upload-controller.js";
import { gatewayAuth, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.mimetype)) {
      return cb(new Error("Invalid file type") as any, false);
    }
    cb(null, true);
  },
});

router.post(
  "/upload",
  gatewayAuth,
  isAdmin,
  upload.array("images", 10),
  uploadImages,
);

export default router;
