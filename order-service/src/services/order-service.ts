import { cache } from "../lib/cacheHelper.js";
import { AppError } from "../middlewares/errorMiddleware.js";
import { orderRepository } from "../repositories/order-repository.js";
import {
  getVariantsByIds,
  reserveStock,
  releaseStock,
} from "../lib/productServiceClient.js";
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
  // look for edge cases and potenntial errors

  private async releaseOrderItems(
    items: { variantId: string; quantity: number }[],
    context: string,
  ): Promise<void> {
    await Promise.allSettled(
      items.map(({ variantId, quantity }) =>
        releaseStock(variantId, quantity).catch((err) =>
          logger.error("Failed to release stock", { variantId, context, err }),
        ),
      ),
    );
  }

  async createOrder(
    userId: string,
    body: CreateOrderDTO,
  ): Promise<PrismaOrderWithItems> {
    const variantIds = body.items.map((i) => i.variantId);
    const variantMap = await getVariantsByIds(variantIds);

    // Validate all items first before touching stock
    const resolvedItems: CreateOrderItemResolved[] = body.items.map((item) => {
      const variant = variantMap.get(item.variantId);
      if (!variant) {
        throw new AppError(`Variant ${item.variantId} not found`, 404);
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

    // Reserve stock one by one — track what succeeded for rollback
    const reserved: { variantId: string; quantity: number }[] = [];

    for (const item of resolvedItems) {
      const success = await reserveStock(item.variantId, item.quantity);

      if (!success) {
        // This item failed — roll back everything reserved so far
        logger.warn("Stock reservation failed, rolling back", {
          failedVariantId: item.variantId,
          reservedSoFar: reserved,
        });
        await this.releaseOrderItems(reserved, "createOrder-rollback");
        throw new AppError(
          `Insufficient stock for variant ${item.variantId}`,
          400,
        );
      }

      reserved.push({ variantId: item.variantId, quantity: item.quantity });
    }

    // All stock reserved — now persist the order
    // If DB write fails, roll back stock
    let order: PrismaOrderWithItems;
    try {
      const totalAmount = resolvedItems.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );

      order = await orderRepository.create({
        userId,
        status: OrderStatus.PENDING,
        items: resolvedItems,
        shippingAddress: body.shippingAddress,
        totalAmount,
      });
    } catch (err) {
      logger.error("Order DB write failed, rolling back stock", { err });
      await this.releaseOrderItems(reserved, "createOrder-db-failure");
      throw err;
    }

    await this.invalidateUserOrderCache(userId);
    logger.info("Order created", {
      userId,
      orderId: order.id,
      itemCount: resolvedItems.length,
    });

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

    // Release stock after DB is updated — best effort
    await this.releaseOrderItems(
      order.items.map((i) => ({
        variantId: i.variantId,
        quantity: i.quantity,
      })),
      `cancelOrder:${orderId}`,
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

    if (status === OrderStatus.CANCELLED) {
      await this.releaseOrderItems(
        order.items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
        })),
        `updateStatus-cancelled:${orderId}`,
      );
    }

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
