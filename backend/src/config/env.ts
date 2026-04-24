import "dotenv/config";

import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().int().positive().default(3333),
  DATABASE_URL: z.string().min(1),
  REDIS_HOST: z.string().min(1).default("redis"),
  REDIS_PORT: z.coerce.number().int().positive().default(6379),
  REDIS_PASSWORD: z.string().optional(),
  REDIS_DB: z.coerce.number().int().nonnegative().default(0),
  REDIS_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(60),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  FRONTEND_URL: z.string().default("http://localhost:5173"),
  SWAGGER_ROUTE_PREFIX: z.string().default("/docs"),
  RANKING_LIMIT: z.coerce.number().int().positive().default(10)
});

const parsedEnv = envSchema.safeParse(process.env);

if (!parsedEnv.success) {
  console.error("Invalid environment variables", parsedEnv.error.flatten().fieldErrors);
  throw new Error("Environment validation failed");
}

export const env = parsedEnv.data;
