import { Router } from "express";
import { ProductController } from "../controllers/product-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  createProductSchema,
  getAllProductsSchema,
} from "../validators/productValidator.js";

const router = Router();
const controller = new ProductController();

router.post("/", validate(createProductSchema), controller.createProduct);

router.get(
  "/",
  validate(getAllProductsSchema, "query"),
  controller.listProducts,
);

router.get("/:id", controller.getProductById);

router.delete("/:id", controller.deleteProduct);

export default router;
