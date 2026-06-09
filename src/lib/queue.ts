import { Queue, Worker, type ConnectionOptions } from "bullmq";

const redisConnection: ConnectionOptions = {
  url: process.env.REDIS_URL ?? "redis://localhost:6379",
};

export const emailQueue = new Queue("email", { connection: redisConnection });
export const searchIndexQueue = new Queue("search-index", { connection: redisConnection });

export type EmailJob =
  | { type: "welcome"; to: string; name: string }
  | { type: "order_confirmation"; to: string; name: string; orderNumber: string; total: string }
  | { type: "access_code"; to: string; studentName: string; username: string; accessCode: string; schoolName: string };

export async function enqueueEmail(job: EmailJob) {
  await emailQueue.add(job.type, job, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
}

export async function enqueueSearchIndex(type: string, id: string, data: Record<string, unknown>) {
  await searchIndexQueue.add(`${type}:${id}`, { type, id, data }, { attempts: 2 });
}
