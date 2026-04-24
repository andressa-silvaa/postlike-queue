import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

import { LikesService } from "../services/likes.service.js";
import { PostsService } from "../services/posts.service.js";

const postParamsSchema = z.object({
  id: z.string().min(1)
});

const likeBodySchema = z.object({
  userId: z.string().min(1, "Informe o identificador do usuário.")
});

const createPostBodySchema = z.object({
  title: z.string().min(1, "Informe o título do post."),
  content: z.string().min(1, "Informe o conteúdo do post.")
});

type PostParamsRequest = FastifyRequest<{
  Params: { id: string };
}>;

type CreatePostRequest = FastifyRequest<{
  Body: { title: string; content: string };
}>;

type CreateLikeRequest = FastifyRequest<{
  Params: { id: string };
  Body: { userId: string };
}>;

export class PostsController {
  constructor(
    private readonly postsService: PostsService,
    private readonly likesService: LikesService
  ) {}

  listPosts = async (_request: FastifyRequest, reply: FastifyReply) => {
    const posts = await this.postsService.listPosts();

    return reply.send({ items: posts });
  };

  createPost = async (request: CreatePostRequest, reply: FastifyReply) => {
    const { title, content } = createPostBodySchema.parse(request.body);
    const post = await this.postsService.createPost(title, content);

    return reply.status(201).send(post);
  };

  getPostById = async (request: PostParamsRequest, reply: FastifyReply) => {
    const { id } = postParamsSchema.parse(request.params);
    const post = await this.postsService.getPostById(id);

    return reply.send(post);
  };

  getLikesCount = async (request: PostParamsRequest, reply: FastifyReply) => {
    const { id } = postParamsSchema.parse(request.params);
    const likes = await this.postsService.getLikesCount(id);

    return reply.send(likes);
  };

  createLike = async (request: CreateLikeRequest, reply: FastifyReply) => {
    const { id } = postParamsSchema.parse(request.params);
    const { userId } = likeBodySchema.parse(request.body);
    const result = await this.likesService.enqueueLike(id, userId);

    return reply.status(202).send(result);
  };

  getTopLikedRanking = async (_request: FastifyRequest, reply: FastifyReply) => {
    const ranking = await this.postsService.getTopLikedRanking();

    return reply.send(ranking);
  };
}
