import { Queue } from "bullmq";

import type { LikeJobData } from "../types/api.js";
import { jobNames, queueNames } from "./queue-names.js";

export class LikeQueue {
  private readonly queue: Queue<LikeJobData>;

  constructor(connection: { host: string; port: number; password?: string; db?: number }) {
    this.queue = new Queue<LikeJobData>(queueNames.likes, {
      connection,
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 500,
        backoff: {
          type: "exponential",
          delay: 1000
        }
      }
    });
  }

  async enqueue(data: LikeJobData): Promise<void> {
    await this.queue.add(jobNames.processLike, data);
  }

  async close(): Promise<void> {
    await this.queue.close();
  }
}
