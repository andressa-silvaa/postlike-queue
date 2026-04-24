import { Redis } from "ioredis";

import { env } from "../config/env.js";

export const redisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  db: env.REDIS_DB,
  maxRetriesPerRequest: null
} as const;

export const redis = new Redis(redisOptions);
