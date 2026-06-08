import type { ApiError, PaginatedResponse, PaginationMeta, QueryParams } from "@/types";

/** Simulated network latency so loading/skeleton states are visible during development. */
const MOCK_LATENCY_MS = 350;

export function mockDelay<T>(value: T, ms: number = MOCK_LATENCY_MS): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), ms));
}

export function mockReject(message: string, status = 400, code?: string): Promise<never> {
  const error: ApiError = { status, message, code };
  return new Promise((_, reject) => setTimeout(() => reject(error), MOCK_LATENCY_MS));
}

/** Slices an in-memory array into the paginated shape real endpoints will return. */
export function paginate<T>(items: T[], params: QueryParams = {}): PaginatedResponse<T> {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 20;
  const start = (page - 1) * pageSize;
  const data = items.slice(start, start + pageSize);
  const meta: PaginationMeta = {
    page,
    pageSize,
    total: items.length,
    totalPages: Math.max(1, Math.ceil(items.length / pageSize)),
  };
  return { data, meta };
}

export function searchFilter<T>(items: T[], search: string | undefined, fields: (keyof T)[]): T[] {
  if (!search?.trim()) return items;
  const needle = search.trim().toLowerCase();
  return items.filter((item) =>
    fields.some((field) => String(item[field] ?? "").toLowerCase().includes(needle)),
  );
}
