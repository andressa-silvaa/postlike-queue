import type { FastifyInstance } from "fastify";

import { PostsController } from "../controllers/posts.controller.js";
import { getLikesCountSchema, createLikeSchema } from "../schemas/likes.schemas.js";
import {
  createPostSchema,
  getPostByIdSchema,
  getTopLikedRankingSchema,
  listPostsSchema
} from "../schemas/posts.schemas.js";

export async function registerPostRoutes(
  app: FastifyInstance,
  controller: PostsController
): Promise<void> {
  app.get("/posts", { schema: listPostsSchema }, controller.listPosts);
  app.post("/posts", { schema: createPostSchema }, controller.createPost);
  app.get(
    "/posts/ranking/top-liked",
    { schema: getTopLikedRankingSchema },
    controller.getTopLikedRanking
  );
  app.get("/posts/:id", { schema: getPostByIdSchema }, controller.getPostById);
  app.post("/posts/:id/likes", { schema: createLikeSchema }, controller.createLike);
  app.get("/posts/:id/likes", { schema: getLikesCountSchema }, controller.getLikesCount);
}
