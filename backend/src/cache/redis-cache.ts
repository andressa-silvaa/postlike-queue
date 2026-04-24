type RedisClient = {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode: "EX", ttlInSeconds: number): Promise<unknown>;
  del(key: string): Promise<number>;
};

export class RedisCache {
  constructor(
    private readonly client: RedisClient,
    private readonly ttlInSeconds: number
  ) {}

  async get<T>(key: string): Promise<T | null> {
    const cachedValue = await this.client.get(key);

    if (!cachedValue) {
      return null;
    }

    return JSON.parse(cachedValue) as T;
  }

  async set<T>(key: string, value: T, ttlInSeconds = this.ttlInSeconds): Promise<void> {
    await this.client.set(key, JSON.stringify(value), "EX", ttlInSeconds);
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }
}
