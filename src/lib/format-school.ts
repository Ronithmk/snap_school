import type { School, SchoolSettings, SchoolStatus } from "@/types/tenant";

type PrismaSchoolRow = {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  description: string | null;
  status: string;
  settings: unknown; // string (SQLite) | JsonValue (PostgreSQL)
  createdAt: Date;
  updatedAt: Date;
};

const DEFAULT_SCHOOL_SETTINGS: SchoolSettings = {
  countryCode: "US",
  currencyCode: "USD",
  tax: { enabled: true, rate: 0, label: "Sales Tax", inclusive: false },
};

export function formatDbSchool(
  s: PrismaSchoolRow,
  counts: { classCount?: number; albumCount?: number } = {},
): School {
  const raw =
    typeof s.settings === "string"
      ? JSON.parse(s.settings)
      : (s.settings ?? {});
  const settings: SchoolSettings = {
    ...DEFAULT_SCHOOL_SETTINGS,
    ...raw,
    tax: { ...DEFAULT_SCHOOL_SETTINGS.tax, ...(raw.tax ?? {}) },
  };
  return {
    id: s.id,
    slug: s.slug,
    name: s.name,
    logoUrl: s.logoUrl ?? undefined,
    bannerUrl: s.bannerUrl ?? undefined,
    description: s.description ?? undefined,
    status: s.status as SchoolStatus,
    settings,
    classCount: counts.classCount ?? 0,
    albumCount: counts.albumCount ?? 0,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}
