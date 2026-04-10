import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { orderService } from "../services/order-service.js";
import { OrderStatus } from "../types/orderTypes.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { getSingleParam } from "../lib/orderHelpers.js";

const parseOrderStatus = (value: unknown): OrderStatus => {
  if (typeof value !== "string") {
    throw new AppError("Status must be a string", 400);
  }
  if (!Object.values(OrderStatus).includes(value as OrderStatus)) {
    throw new AppError(`Invalid status: ${value}`, 400);
  }
  return value as OrderStatus;
};

export class OrderController {
  createOrder = asyncHandler(async (req: Request, res: Response) => {
    const order = await orderService.createOrder(req.user!.userId, req.body);
    res.status(201).json({ success: true, data: order });
  });

  getUserOrders = asyncHandler(async (req: Request, res: Response) => {
    const orders = await orderService.getOrdersByUser(req.user!.userId);
    res.status(200).json({ success: true, data: orders });
  });

  getOrderById = asyncHandler(async (req: Request, res: Response) => {
    const orderId = getSingleParam(req.params.id, "orderId");
    const order = await orderService.getOrderById(orderId, req.user!.userId);
    res.status(200).json({ success: true, data: order });
  });

  cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const orderId = getSingleParam(req.params.id, "orderId");
    const order = await orderService.cancelOrder(orderId, req.user!.userId);
    res.status(200).json({ success: true, data: order });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const orderId = getSingleParam(req.params.id, "orderId");
    const status = parseOrderStatus(req.body.status);
    const order = await orderService.updateStatus(orderId, status);
    res.status(200).json({ success: true, data: order });
  });
}
