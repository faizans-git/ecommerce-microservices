import prisma from "../lib/db/postgres.js";

export class OrderRepository {
  async create(data: any) {
    return prisma.order.create({
      data: {
        userId: data.userId,
        status: data.status,
        shippingAddress: data.shippingAddress,
        items: {
          create: data.items.map((item: any) => ({
            variantId: item.variantId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: { items: true },
    });
  }

  async findByUserId(userId: string) {
    return prisma.order.findMany({
      where: { userId },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async findById(id: string) {
    return prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });
  }

  async updateStatus(id: string, status: string) {
    return prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    });
  }
}

export const orderRepository = new OrderRepository();
