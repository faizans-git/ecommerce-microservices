import { Router } from "express";
import { cartController } from "../controllers/cart-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import {
  addToCartSchema,
  updateQuantitySchema,
} from "../requestDataValidators/cartSchemas.js";
import { gatewayAuth } from "../middlewares/authMiddleware.js";

const router = Router();

router.use(gatewayAuth);

router.get("/", cartController.getCart);

router.post("/add", validate(addToCartSchema), cartController.addItem);

router.patch(
  "/update",
  validate(updateQuantitySchema),
  cartController.updateItem,
);

router.delete("/item/:variantId", cartController.removeItem);

router.delete("/clear", cartController.clearCart);

export default router;
