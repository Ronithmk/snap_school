"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { BookOpen, Search, Sparkles } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductMockup } from "@/components/storefront/product-mockup";
import { PRODUCT_MOCKUPS } from "@/config/product-mockups";
import { usePublishedLabProducts } from "@/hooks/use-lab";
import { useSchool } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import type { LabProductType } from "@/types/lab";

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

export default function SchoolCataloguePage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: products, isLoading } = usePublishedLabProducts();
  const [search, setSearch] = useState("");
  const [type, setType] = useState<string>("__all__");

  const filtered = useMemo(() => {
    if (!products) return [];
    return products.filter((p) => {
      const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase());
      const matchType = type === "__all__" || p.type === type;
      return matchSearch && matchType;
    });
  }, [products, search, type]);

  const types = useMemo(() => {
    if (!products) return [];
    return [...new Set(products.map((p) => p.type))];
  }, [products]);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Catalogue</span>
      </nav>

      <PageHeader
        title="Catalogue"
        description="Platform-published products available to all schools."
      />

      {/* Common products — shared catalog with per-kid dynamic photos */}
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Common products</h2>
          </div>
          <Link href={routes.dashboard.schoolPriceLists(schoolId)} className="text-xs font-medium text-primary hover:underline">
            Add to a price list
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          Same products for every school — the photo on each mockup is dynamic and shows each kid&apos;s own photo on their storefront page.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {PRODUCT_MOCKUPS.map((preset) => (
            <div key={preset.productType} className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
              <div className="flex items-center justify-center bg-muted p-4">
                <ProductMockup layout={preset.layout} className="max-w-[120px]" />
              </div>
              <div className="space-y-2 p-3">
                <p className="text-sm font-medium leading-snug">{preset.name}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="gap-1 text-xs"><Sparkles className="h-3 w-3" />Dynamic photo</Badge>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">{preset.description}</p>
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(preset.amount, "INR")}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="flex items-center gap-2">
        <span className="h-5 w-1 rounded-full bg-primary" />
        <h2 className="text-lg font-semibold tracking-tight">Lab products</h2>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search catalogue…" className="pl-9" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)} containerClassName="sm:w-44">
          <option value="__all__">All types</option>
          {types.map((t) => (
            <option key={t} value={t}>{TYPE_LABELS[t] ?? t}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-52 rounded-xl" />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={BookOpen} title="No catalogue items" description="No published products are available in the catalogue yet." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <div key={product.id} className="overflow-hidden rounded-xl border bg-card transition-shadow hover:shadow-md">
              {product.previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.previewImageUrl} alt={product.name} className="h-32 w-full object-cover" />
              ) : (
                <div className="flex h-32 items-center justify-center bg-muted">
                  <BookOpen className="h-8 w-8 text-muted-foreground/30" />
                </div>
              )}
              <div className="p-3 space-y-2">
                <p className="text-sm font-medium leading-snug">{product.name}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant="outline" className="text-xs">{TYPE_LABELS[product.type] ?? product.type}</Badge>
                  <span className="text-xs text-muted-foreground">{product.dimensions.label}</span>
                </div>
                {product.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2">{product.description}</p>
                )}
                <p className="text-sm font-semibold tabular-nums">{formatCurrency(product.price, product.currencyCode)}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
