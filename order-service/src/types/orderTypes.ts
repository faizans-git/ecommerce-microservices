import type { Order, OrderItem } from "../generated/prisma/client.js";

export enum OrderStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  SHIPPED = "SHIPPED",
  DELIVERED = "DELIVERED",
  CANCELLED = "CANCELLED",
}

export interface ShippingAddress {
  street: string;
  city: string;
  country: string;
  zip: string;
}

export interface CreateOrderItemInput {
  variantId: string;
  quantity: number;
}

export interface CreateOrderDTO {
  items: CreateOrderItemInput[];
  shippingAddress: ShippingAddress;
}

export interface CreateOrderItemResolved {
  variantId: string;
  quantity: number;
  price: number;
}

export interface CreateOrderRepoInput {
  userId: string;
  status: OrderStatus;
  items: CreateOrderItemResolved[];
  shippingAddress: ShippingAddress;
  totalAmount: number;
}

export type PrismaOrderWithItems = Order & { items: OrderItem[] };
