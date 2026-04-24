CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "likes_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "post_likes_post_id_user_id_key" ON "post_likes"("post_id", "user_id");
CREATE INDEX "posts_likes_count_idx" ON "posts"("likes_count");
CREATE INDEX "post_likes_post_id_idx" ON "post_likes"("post_id");
CREATE INDEX "post_likes_user_id_idx" ON "post_likes"("user_id");

ALTER TABLE "post_likes"
ADD CONSTRAINT "post_likes_post_id_fkey"
FOREIGN KEY ("post_id") REFERENCES "posts"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
