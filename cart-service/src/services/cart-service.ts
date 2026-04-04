import { cartCache } from "../lib/redisHelper";

// Dont forget to add update variety

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

    if (quantity <= 0) {
      await cartCache.hDel(key, variantId);
      return null;
    }

    await cartCache.hSet(key, variantId, quantity);
    await cartCache.setExpire(key, this.CART_TTL);

    return { variantId, quantity };
  }

  async removeFromCart(userId: string, variantId: string): Promise<void> {
    await cartCache.hDel(this.getCartKey(userId), variantId);
  }

  async clearUserCart(userId: string): Promise<void> {
    await cartCache.del(this.getCartKey(userId));
  }
}

export const cartService = new CartService();
