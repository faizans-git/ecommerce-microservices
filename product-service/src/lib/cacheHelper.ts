import redis from "./db/redis.js";

export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  },

  async set(key: string, value: unknown, ttl = 300) {
    await redis.set(key, JSON.stringify(value), {
      EX: ttl,
    });
  },

  async del(key: string) {
    await redis.del(key);
  },
};
