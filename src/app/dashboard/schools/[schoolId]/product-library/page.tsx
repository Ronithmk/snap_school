"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ExternalLink, Package, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLabProducts } from "@/hooks/use-lab";
import { useSchool } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { LabProductStatus, LabProductType } from "@/types/lab";

interface Props { params: Promise<{ schoolId: string }> }

const TYPE_LABELS: Record<LabProductType, string> = {
  single_print: "Single Print",
  collage: "Collage",
  planche_1: "Planche 1",
  planche_2: "Planche 2",
  team_sheet: "Team Sheet",
  magazine: "Magazine",
  certificate: "Certificate",
  id_card: "ID Card",
  custom: "Custom",
};

const STATUS_BADGE: Record<LabProductStatus, "default" | "secondary" | "neutral"> = {
  published: "default",
  draft: "secondary",
  archived: "neutral",
};

export default function SchoolProductLibraryPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("__all__");

  const { data: products, isLoading } = useLabProducts(schoolId, {
    search: search || undefined,
    status: status === "__all__" ? undefined : (status as LabProductStatus),
  });

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Product Library</span>
      </nav>

      <PageHeader
        title="Product Library"
        description="Print products and templates configured for this school."
        actions={
          <Link href={routes.dashboard.lab()} className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium shadow-sm hover:bg-accent transition-colors">
            <ExternalLink className="h-4 w-4" />
            Open Lab Editor
          </Link>
        }
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products…" className="pl-9" />
        </div>
        <Select value={status} onChange={(e) => setStatus(e.target.value)} containerClassName="sm:w-44">
          <option value="__all__">All statuses</option>
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </Select>
      </div>

      {isLoading || !products ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : products.data.length === 0 ? (
        <EmptyState icon={Package} title="No products found" description="No products have been added to this school's library yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.data.map((product) => (
            <div key={product.id} className="group overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
              {product.previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.previewImageUrl} alt={product.name} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 items-center justify-center bg-muted">
                  <Package className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-3 space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium leading-snug">{product.name}</p>
                  <Badge variant={STATUS_BADGE[product.status]} className="shrink-0 text-xs">{product.status}</Badge>
                </div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[product.type] ?? product.type}</Badge>
                  <span className="text-xs text-muted-foreground">{product.dimensions.label}</span>
                </div>
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(product.price, product.currencyCode)}</p>
                {product.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {product.tags.slice(0, 3).map((tag) => (
                      <span key={tag} className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{tag}</span>
                    ))}
                    {product.tags.length > 3 && (
                      <span className="text-xs text-muted-foreground">+{product.tags.length - 3}</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
