export const cacheKeys = {
  postsList: "posts:list",
  postById: (postId: string) => `posts:${postId}`,
  topLikedRanking: "posts:ranking:top-liked"
};
