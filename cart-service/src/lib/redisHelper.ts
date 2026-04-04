import redis from "./db/redis";

export const cartCache = {
  async hGetAll(key: string): Promise<Record<string, string>> {
    return await redis.hGetAll(key);
  },

  async hIncrBy(
    key: string,
    field: string,
    increment: number,
  ): Promise<number> {
    return await redis.hIncrBy(key, field, increment);
  },

  async hSet(
    key: string,
    field: string,
    value: string | number,
  ): Promise<void> {
    await redis.hSet(key, field, value);
  },

  async hDel(key: string, field: string): Promise<void> {
    await redis.hDel(key, field);
  },

  async del(key: string): Promise<void> {
    await redis.del(key);
  },

  async setExpire(key: string, ttl: number): Promise<void> {
    await redis.expire(key, ttl);
  },
};
