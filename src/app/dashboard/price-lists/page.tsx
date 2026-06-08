"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Loader2, Pencil, Plus, Star, Tag } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceListFormSheet } from "@/components/dashboard";
import { usePriceLists, useUpdatePriceList } from "@/hooks/use-pricing";
import { formatCurrency } from "@/config/currency";
import type { ApiError, PriceList } from "@/types";

export default function DashboardPriceListsPage() {
  const { data: priceLists, isLoading } = usePriceLists();
  const updatePriceList = useUpdatePriceList();

  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PriceList | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(priceList: PriceList) {
    setEditing(priceList);
    setFormOpen(true);
  }

  async function handleMakeDefault(priceList: PriceList) {
    try {
      await updatePriceList.mutateAsync({ id: priceList.id, input: { isDefault: true } });
      toast.success(`${priceList.name} is now the default for ${priceList.countryCode}.`);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't update the price list. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Price Lists"
        description="Manage reusable pricing templates that schools and albums can apply to their galleries."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Add price list
          </Button>
        }
      />

      {isLoading || !priceLists ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      ) : priceLists.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No price lists yet"
          description="Create a price list to define how families are charged for prints, downloads, and packages."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add price list
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {priceLists.map((priceList) => (
            <Card key={priceList.id}>
              <CardContent className="space-y-4 p-5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">{priceList.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {priceList.countryCode} · {priceList.currencyCode}
                    </p>
                  </div>
                  {priceList.isDefault ? (
                    <Badge variant="positive" className="shrink-0">
                      <Star className="h-3 w-3" />
                      Default
                    </Badge>
                  ) : null}
                </div>

                <ul className="space-y-1.5 text-sm">
                  {priceList.items.slice(0, 4).map((item) => (
                    <li key={item.id} className="flex items-center justify-between gap-2">
                      <span className="truncate text-muted-foreground">{item.name}</span>
                      <span className="shrink-0 font-medium tabular-nums">{formatCurrency(item.amount, priceList.currencyCode)}</span>
                    </li>
                  ))}
                  {priceList.items.length > 4 ? (
                    <li className="text-xs text-muted-foreground">+{priceList.items.length - 4} more items</li>
                  ) : null}
                </ul>

                {priceList.bulkDiscounts.length > 0 ? (
                  <p className="text-xs text-muted-foreground">
                    Bulk discounts: {priceList.bulkDiscounts.map((tier) => `${tier.minQuantity}+ for ${tier.discountPercent}% off`).join(" · ")}
                  </p>
                ) : null}

                <div className="flex items-center gap-2 pt-1">
                  <Button variant="outline" size="sm" onClick={() => openEdit(priceList)}>
                    <Pencil className="h-4 w-4" />
                    Edit
                  </Button>
                  {!priceList.isDefault ? (
                    <Button variant="ghost" size="sm" onClick={() => handleMakeDefault(priceList)} disabled={updatePriceList.isPending}>
                      {updatePriceList.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Star className="h-4 w-4" />}
                      Make default
                    </Button>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <PriceListFormSheet open={formOpen} onOpenChange={setFormOpen} priceList={editing} />
    </div>
  );
}
