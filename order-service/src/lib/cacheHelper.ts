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

  async deletePattern(pattern: string): Promise<void> {
    const keys: string[] = [];

    for await (const batch of redis.scanIterator({
      MATCH: pattern,
      COUNT: 100,
    })) {
      keys.push(...batch);
    }

    if (keys.length > 0) {
      const pipeline = redis.multi();
      keys.forEach((key) => pipeline.unlink(key));
      await pipeline.exec();
    }
  },
};
