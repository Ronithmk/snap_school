import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

// Cache the client across module reloads (dev) and across invocations within the same
// warm serverless instance (prod) — without this, every request opens a fresh connection
// pool that's never closed, eventually exhausting the database's connection limit.
globalForPrisma.prisma = db;
