export type PostItem = {
  id: string;
  title: string;
  content: string;
  likesCount: number;
  createdAt: Date;
};

export type LikeJobData = {
  postId: string;
  userId: string;
};

export type EnqueueLikeResponse = {
  message: string;
  postId: string;
  userId: string;
};
