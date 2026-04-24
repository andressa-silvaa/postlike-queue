import type { Post } from "../types/post";

type PostCardProps = {
  post: Post;
  isSelected: boolean;
  onSelect: (postId: string) => void;
};

export function PostCard({ post, isSelected, onSelect }: PostCardProps) {
  return (
    <button
      type="button"
      className={`post-card ${isSelected ? "selected" : ""}`}
      onClick={() => onSelect(post.id)}
    >
      <span className="post-card-title">{post.title}</span>
      <span className="post-card-meta">{post.likesCount} curtidas</span>
    </button>
  );
}
