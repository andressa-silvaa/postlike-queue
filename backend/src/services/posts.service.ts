import { cacheKeys } from "../cache/cache-keys.js";
import type { RedisCache } from "../cache/redis-cache.js";
import { NotFoundError } from "../lib/errors.js";
import { PostsRepository } from "../repositories/posts.repository.js";

export class PostsService {
  constructor(
    private readonly postsRepository: PostsRepository,
    private readonly cache: RedisCache,
    private readonly rankingLimit: number
  ) {}

  async listPosts() {
    return this.postsRepository.findAll();
  }

  async createPost(title: string, content: string) {
    return this.postsRepository.create(title, content);
  }

  async getPostById(id: string) {
    const cachedPost = await this.cache.get<Awaited<ReturnType<PostsRepository["findById"]>>>(
      cacheKeys.postById(id)
    );

    if (cachedPost) {
      return cachedPost;
    }

    const post = await this.postsRepository.findById(id);

    if (!post) {
      throw new NotFoundError("Post não encontrado.");
    }

    await this.cache.set(cacheKeys.postById(id), post);

    return post;
  }

  async getLikesCount(id: string) {
    const likesCount = await this.postsRepository.getLikesCount(id);

    if (likesCount === null) {
      throw new NotFoundError("Post não encontrado.");
    }

    return {
      postId: id,
      likesCount
    };
  }

  async getTopLikedRanking() {
    const cachedRanking = await this.cache.get<Awaited<
      ReturnType<PostsRepository["getTopLiked"]>
    >>(cacheKeys.topLikedRanking);

    if (cachedRanking) {
      return {
        items: cachedRanking,
        cached: true
      };
    }

    const ranking = await this.postsRepository.getTopLiked(this.rankingLimit);
    await this.cache.set(cacheKeys.topLikedRanking, ranking);

    return {
      items: ranking,
      cached: false
    };
  }
}
