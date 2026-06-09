"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ExternalLink, ImagePlus, Layers, Package, Wand2 } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Button, buttonVariants } from "@/components/ui/button";
import { useLabStore } from "@/stores/lab.store";
import { useLabProducts } from "@/hooks/use-lab";
import { useSchools } from "@/hooks/use-tenant";
import { useSession } from "@/hooks/use-auth";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/config/currency";
import { LAB_PRODUCT_STATUS_LABELS, LAB_PRODUCT_STATUS_TONES } from "@/config/constants";
import { Badge } from "@/components/ui/badge";

export default function DashboardLabPage() {
  const { user } = useSession();
  const { data: schoolsPage } = useSchools();
  const allSchools = schoolsPage?.data;
  const { activeSchoolId, setActiveSchoolId } = useLabStore();

  // Auto-set school for school_admin
  useEffect(() => {
    if (!activeSchoolId && user?.role === "school_admin" && user.schoolIds?.length) {
      setActiveSchoolId(user.schoolIds[0]);
    } else if (!activeSchoolId && allSchools && allSchools.length > 0) {
      setActiveSchoolId(allSchools[0].id);
    }
  }, [user, allSchools, activeSchoolId, setActiveSchoolId]);

  const { data: productsPage, isLoading } = useLabProducts(activeSchoolId ?? undefined, { pageSize: 6 });
  const products = productsPage?.data ?? [];

  const publishedCount = products.filter((p) => p.status === "published").length;
  const draftCount = products.filter((p) => p.status === "draft").length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Product Lab"
          description="Design printable photo products and control which appear in your price lists and cart."
        />

        {user?.role === "platform_admin" && allSchools ? (
          <Select
            value={activeSchoolId ?? ""}
            onChange={(e) => setActiveSchoolId(e.target.value || null)}
            containerClassName="sm:w-64"
            aria-label="Select school"
          >
            <option value="">Select a school…</option>
            {allSchools.map((school) => (
              <option key={school.id} value={school.id}>
                {school.name}
              </option>
            ))}
          </Select>
        ) : null}
      </div>

      {!activeSchoolId ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Wand2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Select a school above to manage its Product Lab.</p>
        </div>
      ) : (
        <>
          {/* Stats row */}
          <div className="grid gap-4 sm:grid-cols-3">
            <StatCard icon={Package} label="Published products" value={isLoading ? "…" : String(publishedCount)} />
            <StatCard icon={Layers} label="Draft products" value={isLoading ? "…" : String(draftCount)} />
            <StatCard icon={ImagePlus} label="Total products" value={isLoading ? "…" : String(productsPage?.meta.total ?? 0)} />
          </div>

          {/* Recent products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold">Recent products</h2>
              <Link href={routes.dashboard.labProducts()} className={buttonVariants({ variant: "outline", size: "sm" })}>
                View all
              </Link>
            </div>

            {isLoading ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-36 rounded-xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border p-10 text-center">
                <Package className="mx-auto mb-2 h-7 w-7 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">No products yet. Create your first product in the library.</p>
                <Link href={routes.dashboard.labProducts()} className={buttonVariants({ variant: "default", size: "sm", className: "mt-4" })}>
                  Go to library
                </Link>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                      {product.previewImageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={product.previewImageUrl} alt={product.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          <Package className="h-8 w-8" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium">{product.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {product.dimensions.label} · {formatCurrency(product.price, product.currencyCode)}
                          </p>
                        </div>
                        <Badge variant={LAB_PRODUCT_STATUS_TONES[product.status]} className="shrink-0 text-[10px]">
                          {LAB_PRODUCT_STATUS_LABELS[product.status]}
                        </Badge>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <Link
                          href={routes.dashboard.labEditor(product.id)}
                          className={buttonVariants({ variant: "outline", size: "sm", className: "flex-1 text-xs" })}
                        >
                          <ExternalLink className="h-3 w-3" />
                          Open editor
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-5 w-5 text-primary" />
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
