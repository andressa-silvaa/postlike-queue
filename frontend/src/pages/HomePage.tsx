import { useEffect, useMemo, useState } from "react";

import { CreatePostForm } from "../components/CreatePostForm";
import { FeedbackMessage } from "../components/FeedbackMessage";
import { Layout } from "../components/Layout";
import { PostDetails } from "../components/PostDetails";
import { PostList } from "../components/PostList";
import { RankingList } from "../components/RankingList";
import {
  createPost,
  getLikesCount,
  getPostById,
  getPosts,
  getTopLikedRanking,
  queueLike
} from "../services/api";
import type { Post } from "../types/post";

type FeedbackState =
  | {
      tone: "success" | "error" | "info";
      message: string;
    }
  | null;

export function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [selectedPostLikes, setSelectedPostLikes] = useState<number | null>(null);
  const [ranking, setRanking] = useState<Post[]>([]);
  const [rankingCached, setRankingCached] = useState(false);
  const [postsLoading, setPostsLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [rankingLoading, setRankingLoading] = useState(true);
  const [likeLoading, setLikeLoading] = useState(false);
  const [createPostLoading, setCreatePostLoading] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackState>(null);

  const activePost = useMemo(
    () =>
      (selectedPost && selectedPost.id === selectedPostId
        ? selectedPost
        : posts.find((post) => post.id === selectedPostId)) ?? null,
    [posts, selectedPost, selectedPostId]
  );

  useEffect(() => {
    void refreshPosts();
    void refreshRanking();
  }, []);

  useEffect(() => {
    if (!selectedPostId && posts.length > 0) {
      setSelectedPostId(posts[0].id);
    }
  }, [posts, selectedPostId]);

  useEffect(() => {
    if (!selectedPostId) {
      return;
    }

    void refreshSelectedPost(selectedPostId);
  }, [selectedPostId]);

  async function refreshPosts() {
    setPostsLoading(true);

    try {
      const data = await getPosts();
      setPosts(data);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível carregar os posts."
      });
    } finally {
      setPostsLoading(false);
    }
  }

  async function refreshRanking() {
    setRankingLoading(true);

    try {
      const data = await getTopLikedRanking();
      setRanking(data.items);
      setRankingCached(data.cached);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível carregar o ranking."
      });
    } finally {
      setRankingLoading(false);
    }
  }

  async function refreshSelectedPost(postId = selectedPostId) {
    if (!postId) {
      return;
    }

    setDetailsLoading(true);
    setSelectedPost(null);
    setSelectedPostLikes(null);

    try {
      const [post, likes] = await Promise.all([getPostById(postId), getLikesCount(postId)]);
      setSelectedPost(post);
      setSelectedPostLikes(likes.likesCount);
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível carregar os detalhes do post."
      });
    } finally {
      setDetailsLoading(false);
    }
  }

  async function handleLike(userId: string) {
    if (!selectedPostId) {
      return;
    }

    setLikeLoading(true);

    try {
      const result = await queueLike(selectedPostId, userId);

      setFeedback({
        tone: "success",
        message: `${result.message} Atualizando contagens após o processamento...`
      });

      window.setTimeout(() => {
        void refreshPosts();
        void refreshRanking();
        void refreshSelectedPost(selectedPostId);
      }, 800);
    } catch (error) {
      setFeedback({
        tone: "error",
        message:
          error instanceof Error
            ? error.message
            : "Não foi possível registrar a curtida para este usuário."
      });
    } finally {
      setLikeLoading(false);
    }
  }

  async function handleCreatePost(title: string, content: string) {
    setCreatePostLoading(true);

    try {
      const createdPost = await createPost({ title, content });

      setFeedback({
        tone: "success",
        message: "Post criado com sucesso."
      });

      await refreshPosts();
      setSelectedPostId(createdPost.id);
      await refreshSelectedPost(createdPost.id);
      await refreshRanking();
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Não foi possível criar o post."
      });
    } finally {
      setCreatePostLoading(false);
    }
  }

  return (
    <div className="page">
      <header className="hero">
        <p className="eyebrow">Teste técnico</p>
        <h1>Fila de curtidas em posts</h1>
        <p className="hero-copy">
          API em Fastify + Prisma + PostgreSQL + Redis + BullMQ, com interface React simples para
          demonstração.
        </p>
      </header>

      {feedback ? <FeedbackMessage tone={feedback.tone} message={feedback.message} /> : null}

      <CreatePostForm onSubmit={handleCreatePost} loading={createPostLoading} />

      <Layout
        sidebar={
          <PostList
            posts={posts}
            selectedPostId={selectedPostId}
            onSelect={setSelectedPostId}
            loading={postsLoading}
          />
        }
      >
        <div className="content-grid">
          <PostDetails
            post={activePost}
            likesCount={selectedPostLikes}
            loading={detailsLoading}
            likeLoading={likeLoading}
            onLike={handleLike}
            onRefresh={async () => {
              await refreshPosts();
              await refreshSelectedPost();
              await refreshRanking();
            }}
          />

          <RankingList posts={ranking} cached={rankingCached} loading={rankingLoading} />
        </div>
      </Layout>
    </div>
  );
}
