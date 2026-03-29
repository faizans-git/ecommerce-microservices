import { Router } from "express";
import { ProductController } from "../controllers/product-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createProductSchema,
  getAllProductsSchema,
} from "../validators/productValidator.js";
import { authMiddleware } from "../middlewares/authMiddleware.js";

const router = Router();
const controller = new ProductController();

router.post(
  "/",
  authMiddleware,
  validate(createProductSchema),
  controller.createProduct,
);

router.get(
  "/",
  validate(getAllProductsSchema, "query"),
  controller.listProducts,
);

router.get("/:id", controller.getProductById);

router.delete("/:id", authMiddleware, controller.deleteProduct);

export default router;
