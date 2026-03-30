import { Router } from "express";
import { ProductController } from "../controllers/product-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createProductSchema,
  getAllProductsSchema,
  updateProductSchema,
} from "../validators/productValidator.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";
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
  authMiddleware,
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
  authMiddleware,
  productDeleteLimiter,
  controller.deleteProduct,
);

router.patch(
  "/:id",
  authMiddleware,
  isAdmin,
  productMutateLimiter,
  validate(updateProductSchema),
  controller.updateProduct,
);
