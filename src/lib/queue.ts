import { Queue, type ConnectionOptions } from "bullmq";

export type EmailJob =
  | { type: "welcome"; to: string; name: string }
  | { type: "order_confirmation"; to: string; name: string; orderNumber: string; total: string }
  | { type: "access_code"; to: string; studentName: string; username: string; accessCode: string; schoolName: string };

let _emailQueue: Queue | null = null;
let _searchQueue: Queue | null = null;

function getConnection(): ConnectionOptions {
  return { url: process.env.REDIS_URL ?? "redis://localhost:6379" };
}

function getEmailQueue(): Queue | null {
  if (!process.env.REDIS_URL) return null;
  if (!_emailQueue) _emailQueue = new Queue("email", { connection: getConnection() });
  return _emailQueue;
}

function getSearchQueue(): Queue | null {
  if (!process.env.REDIS_URL) return null;
  if (!_searchQueue) _searchQueue = new Queue("search-index", { connection: getConnection() });
  return _searchQueue;
}

export async function enqueueEmail(job: EmailJob) {
  const q = getEmailQueue();
  if (!q) return; // Redis not configured — skip silently
  await q.add(job.type, job, { attempts: 3, backoff: { type: "exponential", delay: 5000 } });
}

export async function enqueueSearchIndex(type: string, id: string, data: Record<string, unknown>) {
  const q = getSearchQueue();
  if (!q) return;
  await q.add(`${type}:${id}`, { type, id, data }, { attempts: 2 });
}
