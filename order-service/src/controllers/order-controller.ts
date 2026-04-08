import { Request, Response } from "express";
import { asyncHandler } from "../middlewares/asyncHandler.js";
import { orderService } from "../services/order-service.js";

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
    const id = req.params.id as string;
    const order = await orderService.getOrderById(id, req.user!.userId);
    res.status(200).json({ success: true, data: order });
  });

  cancelOrder = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    await orderService.cancelOrder(id, req.user!.userId);
    res.status(200).json({ success: true, message: "Order cancelled" });
  });

  updateOrderStatus = asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const status = req.body.status as string;
    const order = await orderService.updateStatus(id, status);

    res.status(200).json({ success: true, data: order });
  });
}
