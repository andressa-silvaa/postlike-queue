import type { Prisma } from "@prisma/client";

import { cacheKeys } from "../cache/cache-keys.js";
import type { RedisCache } from "../cache/redis-cache.js";
import { AppError, NotFoundError } from "../lib/errors.js";
import { prisma } from "../lib/prisma.js";
import { isDuplicateLikeError, LikesRepository } from "../repositories/likes.repository.js";
import { PostsRepository } from "../repositories/posts.repository.js";
import type { LikeQueue } from "../queue/like-queue.js";
import type { EnqueueLikeResponse, LikeJobData } from "../types/api.js";

export class LikesService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly likesRepository: LikesRepository,
    private readonly queue: LikeQueue,
    private readonly cache: RedisCache
  ) {}

  async enqueueLike(postId: string, userId: string): Promise<EnqueueLikeResponse> {
    const postExists = await this.postsRepository.exists(postId);

    if (!postExists) {
      throw new NotFoundError("Post não encontrado.");
    }

    const likeAlreadyExists = await this.likesRepository.exists(postId, userId);

    if (likeAlreadyExists) {
      throw new AppError("Este usuário já curtiu este post.", 409);
    }

    await this.queue.enqueue({ postId, userId });

    return {
      message: "Curtida recebida e enviada para processamento.",
      postId,
      userId
    };
  }

  async processLike(data: LikeJobData): Promise<{ created: boolean }> {
    try {
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        const likesRepository = new LikesRepository(tx);
        const postsRepository = new PostsRepository(tx);

        await likesRepository.create(data.postId, data.userId);
        await postsRepository.incrementLikesCount(data.postId);
      });
    } catch (error) {
      if (isDuplicateLikeError(error)) {
        return { created: false };
      }

      throw error;
    }

    await Promise.all([
      this.cache.del(cacheKeys.topLikedRanking),
      this.cache.del(cacheKeys.postById(data.postId))
    ]);

    return { created: true };
  }
}
