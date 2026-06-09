import { NextResponse } from "next/server";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json(data, { status });
}

export function err(message: string, status = 400, code?: string) {
  return NextResponse.json({ message, code }, { status });
}

export function paginate<T>(items: T[], page = 1, pageSize = 20) {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  return {
    data: items.slice(start, start + pageSize),
    meta: { page: safePage, pageSize, total, totalPages },
  };
}

export function parseIntParam(v: string | null, fallback: number) {
  const n = parseInt(v ?? "", 10);
  return isNaN(n) ? fallback : n;
}
