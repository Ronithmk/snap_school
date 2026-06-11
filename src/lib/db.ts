import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? new PrismaClient();

// Cache the client across module reloads (dev) and across invocations within the same
// warm serverless instance (prod) — without this, every request opens a fresh connection
// pool that's never closed, eventually exhausting the database's connection limit.
globalForPrisma.prisma = db;

// prisma/schema.prisma (SQLite/dev) declares some columns as `String`, while
// prisma/schema.prod.prisma (Postgres/prod) declares the same columns as `Json`.
// Prisma validates the JS value type against the schema-declared column type, so writes
// must be shaped differently per database — a raw object for Json columns, a JSON string
// for String columns.
export const isPostgres = (process.env.DATABASE_URL ?? "").startsWith("postgres");

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function jsonField(value: unknown): any {
  return isPostgres ? value : JSON.stringify(value);
}
