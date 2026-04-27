import { Router } from "express";
import { upload } from "../lib/multer";
import { uploadImages } from "../controllers/upload-controller";
import { gatewayAuth, isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post(
  "/upload",
  gatewayAuth,
  isAdmin,
  upload.array("images", 10),
  uploadImages,
);

export default router;
