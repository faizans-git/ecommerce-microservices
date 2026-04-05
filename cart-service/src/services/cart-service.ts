import { cartCache } from "../lib/redisHelper";
import { AppError } from "../middlewares/errorMiddleware";

interface CartItem {
  variantId: string;
  quantity: number;
}

export class CartService {
  private readonly CART_TTL = 604800; // 7 days

  private getCartKey(userId: string): string {
    return `cart:${userId}`;
  }

  async getUserCart(userId: string): Promise<CartItem[]> {
    const key = this.getCartKey(userId);
    const data = await cartCache.hGetAll(key);

    return Object.entries(data).map(([variantId, quantity]) => ({
      variantId,
      quantity: parseInt(quantity, 10),
    }));
  }

  async addToCart(
    userId: string,
    variantId: string,
    quantity: number,
  ): Promise<CartItem> {
    const key = this.getCartKey(userId);

    const newQuantity = await cartCache.hIncrBy(key, variantId, quantity);
    await cartCache.setExpire(key, this.CART_TTL);

    return { variantId, quantity: newQuantity };
  }

  async updateQuantity(
    userId: string,
    variantId: string,
    quantity: number,
  ): Promise<CartItem | null> {
    const key = this.getCartKey(userId);

    const existing = await cartCache.hGet(key, variantId);
    if (!existing) throw new AppError("Item not in cart", 404);

    if (quantity <= 0) {
      await cartCache.hDel(key, variantId);
      await cartCache.setExpire(key, this.CART_TTL);
      return null;
    }

    await Promise.all([
      cartCache.hSet(key, variantId, quantity),
      cartCache.setExpire(key, this.CART_TTL),
    ]);

    return { variantId, quantity };
  }

  async removeFromCart(userId: string, variantId: string): Promise<void> {
    const key = this.getCartKey(userId);
    await Promise.all([
      cartCache.setExpire(key, this.CART_TTL),
      cartCache.hDel(key, variantId),
    ]);
  }

  async clearUserCart(userId: string): Promise<void> {
    const key = this.getCartKey(userId);
    await cartCache.del(key);
  }
}

export const cartService = new CartService();
