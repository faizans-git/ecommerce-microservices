import { Router } from "express";
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

const router = Router();
const controller = new ProductController();

router.post(
  "/",
  gatewayAuth,
  isAdmin,
  productWriteLimiter,
  validate(createProductSchema),
  controller.createProduct,
);

router.get(
  "/",
  productReadLimiter,
  validate(getAllProductsSchema, "query"),
  controller.listProducts,
);

router.get("/:id", generalLimiter, controller.getProductById);

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
