import { Router } from "express";
import { ProductController } from "../controllers/product-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createProductSchema,
  getAllProductsSchema,
  updateProductSchema,
} from "../validators/productValidator.js";
import { authMiddleware, isAdmin } from "../middlewares/authMiddleware.js";

const router = Router();
const controller = new ProductController();

router.post(
  "/",
  authMiddleware,
  isAdmin,
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

router.patch(
  "/:id",
  authMiddleware,
  isAdmin,
  validate(updateProductSchema),
  controller.updateProduct,
);

export default router;
