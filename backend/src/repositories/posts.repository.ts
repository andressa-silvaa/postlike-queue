import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

const postSelect = {
  id: true,
  title: true,
  content: true,
  likesCount: true,
  createdAt: true
} as const;

export class PostsRepository {
  constructor(private readonly db: DbClient) {}

  async create(title: string, content: string) {
    return this.db.post.create({
      data: {
        title,
        content
      },
      select: postSelect
    });
  }

  async findAll() {
    return this.db.post.findMany({
      select: postSelect,
      orderBy: {
        createdAt: "desc"
      }
    });
  }

  async findById(id: string) {
    return this.db.post.findUnique({
      where: { id },
      select: postSelect
    });
  }

  async exists(id: string): Promise<boolean> {
    const post = await this.db.post.findUnique({
      where: { id },
      select: { id: true }
    });

    return Boolean(post);
  }

  async getLikesCount(id: string): Promise<number | null> {
    const post = await this.db.post.findUnique({
      where: { id },
      select: { likesCount: true }
    });

    return post?.likesCount ?? null;
  }

  async getTopLiked(limit: number) {
    return this.db.post.findMany({
      select: postSelect,
      orderBy: [
        { likesCount: "desc" },
        { createdAt: "asc" }
      ],
      take: limit
    });
  }

  async incrementLikesCount(id: string) {
    return this.db.post.update({
      where: { id },
      data: {
        likesCount: {
          increment: 1
        }
      }
    });
  }
}
