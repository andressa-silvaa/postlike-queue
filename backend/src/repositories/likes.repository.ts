import type { Prisma, PrismaClient } from "@prisma/client";

type DbClient = PrismaClient | Prisma.TransactionClient;

export class LikesRepository {
  constructor(private readonly db: DbClient) {}

  async exists(postId: string, userId: string): Promise<boolean> {
    const existingLike = await this.db.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      },
      select: {
        id: true
      }
    });

    return Boolean(existingLike);
  }

  async create(postId: string, userId: string) {
    return this.db.postLike.create({
      data: {
        postId,
        userId
      }
    });
  }
}

export function isDuplicateLikeError(error: unknown): boolean {
  if (!error || typeof error !== "object" || !("code" in error)) {
    return false;
  }

  return (error as { code?: string }).code === "P2002";
}
