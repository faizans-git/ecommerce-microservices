// services/order-service.ts
import { cache } from "../lib/cacheHelper.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { orderRepository } from "../repositories/order-repository.js";
import { getVariantsByIds } from "../lib/productServiceClient.js";
import logger from "../lib/logger.js";
import {
  CreateOrderDTO,
  CreateOrderItemResolved,
  OrderStatus,
  PrismaOrderWithItems,
} from "../types/orderTypes.js";

export class OrderService {
  private assertOwnership(order: PrismaOrderWithItems, userId: string): void {
    if (order.userId !== userId) throw new AppError("Forbidden", 403);
  }

  private canCancel(status: OrderStatus): boolean {
    return [OrderStatus.PENDING, OrderStatus.CONFIRMED].includes(status);
  }

  private async invalidateUserOrderCache(
    userId: string,
    orderId?: string,
  ): Promise<void> {
    const ops: Promise<unknown>[] = [
      cache.deletePattern(`orders:list:${userId}`),
    ];
    if (orderId) ops.push(cache.del(`order:${orderId}`));
    await Promise.all(ops);
  }

  async createOrder(
    userId: string,
    body: CreateOrderDTO,
  ): Promise<PrismaOrderWithItems> {
    const variantIds = body.items.map((i) => i.variantId);

    const variantMap = await getVariantsByIds(variantIds);

    const resolvedItems: CreateOrderItemResolved[] = body.items.map((item) => {
      const variant = variantMap.get(item.variantId);

      if (!variant) {
        throw new AppError(`Product variant ${item.variantId} not found`, 404);
      }

      if (variant.stock < item.quantity) {
        throw new AppError(
          `Insufficient stock for variant ${item.variantId}`,
          400,
        );
      }

      return {
        variantId: item.variantId,
        quantity: item.quantity,
        price: variant.price,
      };
    });

    const totalAmount = resolvedItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0,
    );

    const order = await orderRepository.create({
      userId,
      status: OrderStatus.PENDING,
      items: resolvedItems,
      shippingAddress: body.shippingAddress,
      totalAmount,
    });

    await this.invalidateUserOrderCache(userId);
    logger.info("Order created", { userId, orderId: order.id, totalAmount });

    return order;
  }

  async getOrdersByUser(userId: string): Promise<PrismaOrderWithItems[]> {
    const cacheKey = `orders:list:${userId}`;
    const cached = await cache.get<PrismaOrderWithItems[]>(cacheKey);
    if (cached) return cached;

    const orders = await orderRepository.findByUserId(userId);
    await cache.set(cacheKey, orders, 100);
    return orders;
  }

  async getOrderById(
    orderId: string,
    userId: string,
  ): Promise<PrismaOrderWithItems> {
    const cacheKey = `order:${orderId}`;
    const cached = await cache.get<PrismaOrderWithItems>(cacheKey);
    if (cached) {
      this.assertOwnership(cached, userId);
      return cached;
    }

    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);

    this.assertOwnership(order, userId);
    await cache.set(cacheKey, order, 300);
    return order;
  }

  async cancelOrder(
    orderId: string,
    userId: string,
  ): Promise<PrismaOrderWithItems> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);

    this.assertOwnership(order, userId);

    if (!this.canCancel(order.status as OrderStatus)) {
      throw new AppError("Order cannot be cancelled at this stage", 400);
    }

    const updated = await orderRepository.updateStatus(
      orderId,
      OrderStatus.CANCELLED,
    );

    await this.invalidateUserOrderCache(order.userId, orderId);
    logger.info("Order cancelled", { userId, orderId });
    return updated;
  }

  async updateStatus(
    orderId: string,
    status: OrderStatus,
  ): Promise<PrismaOrderWithItems> {
    const order = await orderRepository.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);

    const updated = await orderRepository.updateStatus(orderId, status);

    await this.invalidateUserOrderCache(order.userId, orderId);
    logger.info("Order status updated", {
      orderId,
      userId: order.userId,
      status,
    });
    return updated;
  }
}

export const orderService = new OrderService();
