import type { LabOrientation, LabPage, LabProductDimensions, LabProductStatus, LabProductType } from "@/types/lab";

type PrismaLabProductRow = {
  id: string;
  schoolId: string;
  name: string;
  description: string | null;
  type: string;
  category: string;
  status: string;
  previewImageUrl: string;
  dimensions: unknown;
  orientation: string;
  price: number;
  currencyCode: string;
  taxIncluded: boolean;
  tags: unknown;
  pages: unknown;
  createdAt: Date;
  updatedAt: Date;
};

function parseJson<T>(value: unknown, fallback: T): T {
  if (typeof value === "string") {
    try {
      return JSON.parse(value) as T;
    } catch {
      return fallback;
    }
  }
  return (value as T) ?? fallback;
}

export function fmtLabProduct(p: PrismaLabProductRow) {
  return {
    id: p.id,
    schoolId: p.schoolId,
    name: p.name,
    description: p.description ?? undefined,
    type: p.type as LabProductType,
    category: p.category,
    status: p.status as LabProductStatus,
    previewImageUrl: p.previewImageUrl,
    dimensions: parseJson<LabProductDimensions>(p.dimensions, { label: "", widthCm: 0, heightCm: 0 }),
    orientation: p.orientation as LabOrientation,
    price: p.price,
    currencyCode: p.currencyCode,
    taxIncluded: p.taxIncluded,
    tags: parseJson<string[]>(p.tags, []),
    pages: parseJson<LabPage[]>(p.pages, []),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}
