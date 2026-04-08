import { Router } from "express";
import { OrderController } from "../controllers/order-controller.js";
import { validate } from "../middlewares/validateMiddleware.js";
import { gatewayAuth, isAdmin } from "../middlewares/authMiddleware.js";
import {
  createOrderSchema,
  updateOrderStatusSchema,
} from "../validators/orderValidator.js";
import {
  orderReadLimiter,
  orderWriteLimiter,
  orderMutatationLimiter,
} from "../middlewares/rateLimiter.js";

const router = Router();
const controller = new OrderController();

router.use(gatewayAuth);

router.post(
  "/",
  orderWriteLimiter,
  validate(createOrderSchema),
  controller.createOrder,
);

router.get("/", orderReadLimiter, controller.getUserOrders);

router.get("/:id", orderReadLimiter, controller.getOrderById);

router.patch("/:id/cancel", orderMutatationLimiter, controller.cancelOrder);

router.patch(
  "/:id/status",
  isAdmin,
  orderMutatationLimiter,
  validate(updateOrderStatusSchema),
  controller.updateOrderStatus,
);

export default router;
