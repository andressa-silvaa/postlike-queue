import type { Post } from "../types/post";
import { LikeForm } from "./LikeForm";

type PostDetailsProps = {
  post: Post | null;
  likesCount: number | null;
  loading: boolean;
  likeLoading: boolean;
  onLike: (userId: string) => Promise<void>;
  onRefresh: () => Promise<void>;
};

export function PostDetails({
  post,
  likesCount,
  loading,
  likeLoading,
  onLike,
  onRefresh
}: PostDetailsProps) {
  if (loading) {
    return (
      <section className="panel">
        <h2>Detalhes do post</h2>
        <p className="muted">Carregando detalhes...</p>
      </section>
    );
  }

  if (!post) {
    return (
      <section className="panel">
        <h2>Detalhes do post</h2>
        <p className="muted">Selecione um post na lista para ver os detalhes.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <div className="panel-header">
        <h2>{post.title}</h2>
        <button type="button" className="secondary-button" onClick={() => void onRefresh()}>
          Atualizar
        </button>
      </div>

      <p className="post-content">{post.content}</p>

      <div className="stats-row">
        <div className="stat-box">
          <span className="stat-label">Quantidade de curtidas</span>
          <strong>{likesCount ?? post.likesCount}</strong>
        </div>
        <div className="stat-box">
          <span className="stat-label">ID do post</span>
          <strong className="small-text">{post.id}</strong>
        </div>
      </div>

      <LikeForm onSubmit={onLike} loading={likeLoading} />
    </section>
  );
}
