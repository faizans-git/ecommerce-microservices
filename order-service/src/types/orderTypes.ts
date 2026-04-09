import { Prisma } from "../generated/prisma/client.js";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface OrderItem {
  id: string;
  orderId: string;
  variantId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  items: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export interface CreateOrderItemDTO {
  variantId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderDTO {
  items: CreateOrderItemDTO[];
  shippingAddress: ShippingAddress;
}

export interface CreateOrderRepoInput {
  userId: string;
  status: OrderStatus;
  items: CreateOrderItemDTO[];
  shippingAddress: ShippingAddress;
}

export type PrismaOrderWithItems = Prisma.OrderGetPayload<{
  include: { items: true };
}>;
