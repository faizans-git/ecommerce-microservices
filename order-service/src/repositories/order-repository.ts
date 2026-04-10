import prisma from "../lib/db/postgres.js";
import type {
  CreateOrderRepoInput,
  PrismaOrderWithItems,
} from "../types/orderTypes.js";
import { OrderStatus } from "../types/orderTypes.js";

export class OrderRepository {
  async create(data: CreateOrderRepoInput): Promise<PrismaOrderWithItems> {
    return prisma.order.create({
      data: {
        userId: data.userId,
        status: data.status,
        totalAmount: data.totalAmount,
        shippingAddress: data.shippingAddress as object,
        items: {
          create: data.items.map((item) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findByUserId(userId: string): Promise<PrismaOrderWithItems[]> {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string): Promise<PrismaOrderWithItems | null> {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async updateStatus(
    id: string,
    status: OrderStatus,
  ): Promise<PrismaOrderWithItems> {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }
}

export const orderRepository = new OrderRepository();
