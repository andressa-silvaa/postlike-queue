import type {
  CreatePostPayload,
  LikesCountResponse,
  PostsResponse,
  QueueLikeResponse,
  RankingResponse
} from "../types/api";
import type { Post } from "../types/post";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3333";

type RequestOptions = RequestInit & {
  json?: unknown;
};

async function request<T>(path: string, options?: RequestOptions): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options?.headers ?? {})
    },
    body: options?.json ? JSON.stringify(options.json) : undefined
  });

  if (!response.ok) {
    let message = "Falha na requisição";

    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      message = response.statusText || message;
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

export async function getPosts(): Promise<Post[]> {
  const data = await request<PostsResponse>("/posts");
  return data.items;
}

export async function createPost(payload: CreatePostPayload): Promise<Post> {
  return request<Post>("/posts", {
    method: "POST",
    json: payload
  });
}

export async function getPostById(postId: string): Promise<Post> {
  return request<Post>(`/posts/${postId}`);
}

export async function queueLike(postId: string, userId: string): Promise<QueueLikeResponse> {
  return request<QueueLikeResponse>(`/posts/${postId}/likes`, {
    method: "POST",
    json: { userId }
  });
}

export async function getLikesCount(postId: string): Promise<LikesCountResponse> {
  return request<LikesCountResponse>(`/posts/${postId}/likes`);
}

export async function getTopLikedRanking(): Promise<RankingResponse> {
  return request<RankingResponse>("/posts/ranking/top-liked");
}
