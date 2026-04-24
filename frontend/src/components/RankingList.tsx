import type { Post } from "../types/post";

type RankingListProps = {
  posts: Post[];
  cached: boolean;
  loading: boolean;
};

export function RankingList({ posts, cached, loading }: RankingListProps) {
  return (
    <section className="panel">
      <div className="panel-header">
        <h2>Ranking de mais curtidos</h2>
        <span className="muted">
          {loading ? "Carregando..." : cached ? "Em cache" : "Atualizado agora"}
        </span>
      </div>

      <ol className="ranking-list">
        {posts.map((post) => (
          <li key={post.id} className="ranking-item">
            <div>
              <strong>{post.title}</strong>
              <p>{post.content}</p>
            </div>
            <span>{post.likesCount} curtidas</span>
          </li>
        ))}
      </ol>

      {!posts.length && !loading ? <p className="empty-state">Nenhum post no ranking.</p> : null}
    </section>
  );
}
