import { Router, Request, Response, NextFunction } from "express";
import { ProductController } from "../controllers/product-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createProductSchema,
  getAllProductsSchema,
  updateProductSchema,
} from "../validators/productValidator.js";
import { gatewayAuth, isAdmin } from "../middlewares/authMiddleware.js";
import {
  generalLimiter,
  productDeleteLimiter,
  productMutateLimiter,
  productReadLimiter,
  productWriteLimiter,
} from "../middlewares/rateLimiter.js";
import { AppError } from "../middlewares/errorMiddleware.js";

const router = Router();
const controller = new ProductController();

const INTERNAL_SECRET = process.env.INTERNAL_SECRET;

const internalAuth = (req: Request, res: Response, next: NextFunction) => {
  if (
    !INTERNAL_SECRET ||
    req.headers["x-internal-secret"] !== INTERNAL_SECRET
  ) {
    return next(new AppError("Forbidden", 403));
  }
  next();
};

router.get(
  "/",
  productReadLimiter,
  validate(getAllProductsSchema, "query"),
  controller.listProducts,
);

router.get("/:id", generalLimiter, controller.getProductById);

router.post(
  "/variants/batch",
  internalAuth,
  productReadLimiter,
  controller.getVariantsBatch,
);
router.post(
  "/stock/reserve",
  internalAuth,
  productMutateLimiter,
  controller.reserveStock,
);
router.post(
  "/stock/release",
  internalAuth,
  productMutateLimiter,
  controller.releaseStock,
);

router.post(
  "/",
  gatewayAuth,
  isAdmin,
  productWriteLimiter,
  validate(createProductSchema),
  controller.createProduct,
);

router.delete(
  "/:id",
  gatewayAuth,
  productDeleteLimiter,
  controller.deleteProduct,
);

router.patch(
  "/:id",
  gatewayAuth,
  isAdmin,
  productMutateLimiter,
  validate(updateProductSchema),
  controller.updateProduct,
);

export default router;
