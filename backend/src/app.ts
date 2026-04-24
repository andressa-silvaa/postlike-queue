import cors from "@fastify/cors";
import Fastify from "fastify";
import { ZodError } from "zod";

import { RedisCache } from "./cache/redis-cache.js";
import { env } from "./config/env.js";
import { PostsController } from "./controllers/posts.controller.js";
import { registerSwagger } from "./docs/swagger.js";
import { AppError } from "./lib/errors.js";
import { prisma } from "./lib/prisma.js";
import { redis, redisOptions } from "./lib/redis.js";
import { LikesRepository } from "./repositories/likes.repository.js";
import { PostsRepository } from "./repositories/posts.repository.js";
import { LikeQueue } from "./queue/like-queue.js";
import { registerPostRoutes } from "./routes/posts.routes.js";
import { LikesService } from "./services/likes.service.js";
import { PostsService } from "./services/posts.service.js";

export async function buildApp() {
  const app = Fastify({
    logger: true
  });

  const cache = new RedisCache(redis, env.REDIS_CACHE_TTL_SECONDS);
  const postsRepository = new PostsRepository(prisma);
  const likesRepository = new LikesRepository(prisma);
  const likeQueue = new LikeQueue(redisOptions);
  const postsService = new PostsService(postsRepository, cache, env.RANKING_LIMIT);
  const likesService = new LikesService(postsRepository, likesRepository, likeQueue, cache);
  const postsController = new PostsController(postsService, likesService);

  await app.register(cors, {
    origin: env.CORS_ORIGIN
  });

  await registerSwagger(app);
  await registerPostRoutes(app, postsController);

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof ZodError) {
      return reply.status(400).send({
        message: "Dados inválidos.",
        details: error.flatten()
      });
    }

    if (error instanceof AppError) {
      return reply.status(error.statusCode).send({
        message: error.message
      });
    }

    app.log.error(error);

    return reply.status(500).send({
      message: "Erro interno do servidor."
    });
  });

  app.addHook("onClose", async () => {
    await Promise.allSettled([likeQueue.close(), prisma.$disconnect(), redis.quit()]);
  });

  return app;
}
