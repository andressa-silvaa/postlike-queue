import type { Post } from "../types/post";
import { PostCard } from "./PostCard";

type PostListProps = {
  posts: Post[];
  selectedPostId: string | null;
  onSelect: (postId: string) => void;
  loading: boolean;
};

export function PostList({ posts, selectedPostId, onSelect, loading }: PostListProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Lista de posts</h2>
        {loading ? <span className="muted">Carregando...</span> : null}
      </div>

      <div className="post-list">
        {posts.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            isSelected={selectedPostId === post.id}
            onSelect={onSelect}
          />
        ))}

        {!posts.length && !loading ? <p className="empty-state">Nenhum post encontrado.</p> : null}
      </div>
    </section>
  );
}
