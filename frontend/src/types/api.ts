import type { Post } from "./post";

export type PostsResponse = {
  items: Post[];
};

export type CreatePostPayload = {
  title: string;
  content: string;
};

export type RankingResponse = {
  items: Post[];
  cached: boolean;
};

export type LikesCountResponse = {
  postId: string;
  likesCount: number;
};

export type QueueLikeResponse = {
  message: string;
  postId: string;
  userId: string;
};
