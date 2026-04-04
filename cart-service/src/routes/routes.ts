import { Router } from "express";
import { cartController } from "../controllers/cart-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  addToCartSchema,
  updateQuantitySchema,
} from "../requestDataValidators/cartSchemas.js";

const router = Router();

router.get("/", cartController.getCart);

router.post("/add", validate(addToCartSchema), cartController.addItem);

router.patch(
  "/update",
  validate(updateQuantitySchema),
  cartController.updateItem,
);

router.delete("/item/:varientId", cartController.removeItem);

router.delete("/clear", cartController.clearCart);

export default router;
