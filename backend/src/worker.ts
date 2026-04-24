import { Worker } from "bullmq";

import { RedisCache } from "./cache/redis-cache.js";
import { env } from "./config/env.js";
import { prisma } from "./lib/prisma.js";
import { redis, redisOptions } from "./lib/redis.js";
import { LikesRepository } from "./repositories/likes.repository.js";
import { PostsRepository } from "./repositories/posts.repository.js";
import { LikeQueue } from "./queue/like-queue.js";
import { queueNames } from "./queue/queue-names.js";
import { LikesService } from "./services/likes.service.js";
import type { LikeJobData } from "./types/api.js";

const cache = new RedisCache(redis, env.REDIS_CACHE_TTL_SECONDS);
const postsRepository = new PostsRepository(prisma);
const likesRepository = new LikesRepository(prisma);
const likeQueue = new LikeQueue(redisOptions);
const likesService = new LikesService(postsRepository, likesRepository, likeQueue, cache);

const worker = new Worker<LikeJobData>(
  queueNames.likes,
  async (job) => {
    const result = await likesService.processLike(job.data);

    console.log(
      `[worker] processed like for post=${job.data.postId} user=${job.data.userId} created=${result.created}`
    );
  },
  {
    connection: redisOptions,
    concurrency: 20
  }
);

worker.on("failed", (job, error) => {
  console.error(
    `[worker] failed job ${job?.id ?? "unknown"} for post=${job?.data.postId ?? "unknown"}:`,
    error
  );
});

async function shutdown(): Promise<void> {
  await Promise.allSettled([worker.close(), likeQueue.close(), prisma.$disconnect(), redis.quit()]);
  process.exit(0);
}

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
