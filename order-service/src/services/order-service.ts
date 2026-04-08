// services/order-service.ts
import { AppError } from "../middlewares/errorMiddleware.js";
import { orderRepository } from "../repositories/order-repository.js";

export class OrderService {
  async createOrder(userId: string, body: any) {
    return orderRepository.create({ userId, ...body, status: "PENDING" });
  }

  async getOrdersByUser(userId: string) {
    return orderRepository.findByUserId(userId);
  }

  async getOrderById(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);
    if (order.userId !== userId) throw new AppError("Forbidden", 403);
    return order;
  }

  async cancelOrder(orderId: string, userId: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);
    if (order.userId !== userId) throw new AppError("Forbidden", 403);
    if (!["PENDING", "CONFIRMED"].includes(order.status)) {
      throw new AppError("Order cannot be cancelled at this stage", 400);
    }
    return orderRepository.updateStatus(orderId, "CANCELLED");
  }

  async updateStatus(orderId: string, status: string) {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);
    return orderRepository.updateStatus(orderId, status);
  }
}

export const orderService = new OrderService();
