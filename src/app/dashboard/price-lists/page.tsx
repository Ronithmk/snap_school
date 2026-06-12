"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  Download,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Star,
  Tag,
  Trash2,
  Wand2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceListFormSheet } from "@/components/dashboard";
import { usePriceLists, useUpdatePriceList } from "@/hooks/use-pricing";
import { useSession } from "@/hooks/use-auth";
import { useSchools } from "@/hooks/use-tenant";
import { useLabStore } from "@/stores/lab.store";
import { formatCurrency } from "@/config/currency";
import type { ApiError, PriceItemType, PriceList, PriceListItem } from "@/types";

// ── Display config ────────────────────────────────────────────────

const TYPE_LABEL: Record<PriceItemType, string> = {
  package: "Pack",
  digital_download: "HD File",
  single_print: "Print",
  addon: "Add-on",
};

const TYPE_BADGE: Record<PriceItemType, string> = {
  package:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  digital_download:
    "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  single_print:
    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  addon: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const TYPE_LEFT_BORDER: Record<PriceItemType, string> = {
  package: "border-l-amber-400",
  digital_download: "border-l-blue-400",
  single_print: "border-l-green-400",
  addon: "border-l-orange-400",
};

// ── Grouping ──────────────────────────────────────────────────────

interface ItemGroup {
  key: string;
  header: string;
  subtext?: string;
  type: PriceItemType;
  items: PriceListItem[];
}

function buildGroups(items: PriceListItem[]): ItemGroup[] {
  const groups: ItemGroup[] = [];

  // Each "package" item is its own named section (like PACK XL, PACK L…)
  for (const item of items.filter((i) => i.type === "package")) {
    groups.push({
      key: item.id,
      header: item.name,
      subtext: item.description,
      type: "package",
      items: [item],
    });
  }

  // Remaining types are grouped collectively
  const singles = items.filter((i) => i.type === "single_print");
  const downloads = items.filter((i) => i.type === "digital_download");
  const addons = items.filter((i) => i.type === "addon");

  if (singles.length > 0)
    groups.push({ key: "single_print", header: "Individual Prints", type: "single_print", items: singles });
  if (downloads.length > 0)
    groups.push({ key: "digital_download", header: "Digital Downloads", type: "digital_download", items: downloads });
  if (addons.length > 0)
    groups.push({ key: "addon", header: "Add-ons", type: "addon", items: addons });

  return groups;
}

// ── Page ──────────────────────────────────────────────────────────

export default function DashboardPriceListsPage() {
  const { user } = useSession();
  const { data: schoolsPage } = useSchools();
  const allSchools = schoolsPage?.data ?? [];

  const activeSchoolId = useLabStore((s) => s.activeSchoolId);
  const setActiveSchoolId = useLabStore((s) => s.setActiveSchoolId);

  useEffect(() => {
    if (user?.role === "school_admin" && user.schoolIds?.[0] && !activeSchoolId) {
      setActiveSchoolId(user.schoolIds[0]);
    }
  }, [user, activeSchoolId, setActiveSchoolId]);

  const schoolId =
    user?.role === "school_admin"
      ? (user.schoolIds?.[0] ?? "")
      : (activeSchoolId ?? "");

  const { data: priceLists, isLoading, refetch } = usePriceLists(schoolId || undefined);
  const updatePriceList = useUpdatePriceList(schoolId);

  const [selectedId, setSelectedId] = useState<string>("");
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PriceItemType>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PriceList | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Auto-select default list (or first) when data loads
  useEffect(() => {
    if (priceLists && priceLists.length > 0 && !selectedId) {
      const def = priceLists.find((p) => p.isDefault) ?? priceLists[0];
      setSelectedId(def.id);
    }
  }, [priceLists, selectedId]);

  // Reset selection when switching lists
  useEffect(() => { setSelectedItems(new Set()); }, [selectedId]);

  const activeList = useMemo(
    () => priceLists?.find((p) => p.id === selectedId) ?? null,
    [priceLists, selectedId],
  );

  const filteredItems = useMemo(() => {
    return (activeList?.items ?? []).filter((item) => {
      if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      return true;
    });
  }, [activeList, nameFilter, typeFilter]);

  const groups = useMemo(() => buildGroups(filteredItems), [filteredItems]);

  const allItemIds = filteredItems.map((i) => i.id);
  const allChecked = allItemIds.length > 0 && allItemIds.every((id) => selectedItems.has(id));

  function toggleAll() {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      if (allChecked) allItemIds.forEach((id) => next.delete(id));
      else allItemIds.forEach((id) => next.add(id));
      return next;
    });
  }

  function toggleItem(id: string) {
    setSelectedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function openCreate() { setEditing(null); setFormOpen(true); }
  function openEdit(pl: PriceList) { setEditing(pl); setFormOpen(true); }

  async function handleMakeDefault(pl: PriceList) {
    try {
      await updatePriceList.mutateAsync({ id: pl.id, input: { isDefault: true } });
      toast.success(`"${pl.name}" is now the default price list for this school.`);
    } catch (err) {
      toast.error((err as unknown as ApiError).message ?? "Couldn't update. Please try again.");
    }
  }

  // ── Render ────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      <PageHeader
        title="Price Lists"
        description="Manage pricing templates and product packs for each school's albums."
        actions={
          schoolId ? (
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New price list
            </Button>
          ) : null
        }
      />

      {/* School selector — platform_admin only */}
      {user?.role === "platform_admin" && (
        <Card>
          <CardContent className="flex items-center gap-3 p-4">
            <p className="shrink-0 text-sm font-medium">School</p>
            <Select
              value={activeSchoolId ?? ""}
              onChange={(e) => {
                setActiveSchoolId(e.target.value || null);
                setSelectedId("");
              }}
              containerClassName="max-w-xs"
            >
              <option value="">— Select a school —</option>
              {allSchools.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
          </CardContent>
        </Card>
      )}

      {/* No school selected */}
      {!schoolId ? (
        <EmptyState
          icon={Tag}
          title="Select a school"
          description="Choose a school above to manage its price lists."
        />
      ) : isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !priceLists || priceLists.length === 0 ? (
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
        <>
          {/* ── Price list selector row ── */}
          <div className="flex flex-wrap items-center gap-3">
            <Select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              containerClassName="w-72"
            >
              {priceLists.map((pl) => (
                <option key={pl.id} value={pl.id}>
                  {pl.name}{pl.isDefault ? " [Default]" : ""}
                </option>
              ))}
            </Select>

            {activeList?.isDefault && (
              <Badge variant="positive" className="gap-1 shrink-0">
                <Star className="h-3 w-3" />
                Default
              </Badge>
            )}

            {activeList && !activeList.isDefault && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleMakeDefault(activeList)}
                disabled={updatePriceList.isPending}
              >
                {updatePriceList.isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Star className="h-3.5 w-3.5" />}
                Make default
              </Button>
            )}

            <div className="ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => activeList && openEdit(activeList)}
                disabled={!activeList}
              >
                <Pencil className="h-3.5 w-3.5" />
                Edit list
              </Button>
            </div>
          </div>

          {/* ── Filter bar ── */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
            <input
              type="text"
              placeholder="Product name…"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-8 w-44 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as "" | PriceItemType)}
              containerClassName="w-40"
            >
              <option value="">All types</option>
              {(Object.entries(TYPE_LABEL) as [PriceItemType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">
                {filteredItems.length}/{activeList?.items.length ?? 0} products
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => { setNameFilter(""); setTypeFilter(""); }}
              >
                Reset
              </Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>
          </div>

          {/* ── Action toolbar ── */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Button
              variant="ghost"
              size="sm"
              disabled={selectedItems.size === 0}
              title="Download selected"
            >
              <Download className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={selectedItems.size === 0}
              title="Delete selected"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>

            <div className="mx-1 h-4 w-px bg-border" />

            {activeList && activeList.items.length > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All products configured correctly
              </span>
            )}

            <div className="ml-auto">
              <Button size="sm" onClick={openCreate}>
                <Plus className="h-3.5 w-3.5" />
                Add products
              </Button>
            </div>
          </div>

          {/* ── Table ── */}
          {groups.length === 0 ? (
            <EmptyState
              icon={Package}
              title="No products found"
              description={
                nameFilter || typeFilter
                  ? "No products match your filters. Try resetting them."
                  : "This price list has no products yet."
              }
              action={
                !nameFilter && !typeFilter ? (
                  <Button size="sm" onClick={openCreate}>
                    <Plus className="h-4 w-4" />
                    Add products
                  </Button>
                ) : undefined
              }
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[680px] border-collapse text-sm">
                  {/* Table head */}
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      <th className="w-10 px-3 py-2.5">
                        <input
                          type="checkbox"
                          checked={allChecked}
                          onChange={toggleAll}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                      </th>
                      <th className="w-10 px-2 py-2.5 text-left text-xs font-semibold text-muted-foreground">#</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Product</th>
                      <th className="w-28 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="w-20 px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">Units</th>
                      <th className="w-28 px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">
                        Price
                      </th>
                      <th className="w-36 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">
                        Lab product
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {groups.map(({ key, header, subtext, type, items }) => {
                      let rowCounter = 0;
                      return (
                        <>
                          {/* Section header row */}
                          <tr
                            key={`hdr-${key}`}
                            className="border-y border-border bg-amber-50/60 dark:bg-amber-950/20"
                          >
                            <td colSpan={7} className="px-4 py-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                                  {header}
                                </span>
                                {subtext && (
                                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                    {subtext}
                                  </span>
                                )}
                                <span className="ml-1 text-xs text-muted-foreground">
                                  {items.length} {items.length === 1 ? "product" : "products"}
                                </span>
                              </div>
                            </td>
                          </tr>

                          {/* Item rows within this section */}
                          {items.map((item) => {
                            rowCounter += 1;
                            const n = rowCounter;
                            const checked = selectedItems.has(item.id);
                            return (
                              <tr
                                key={item.id}
                                className={[
                                  "border-b border-border border-l-4 transition-colors last:border-b-0",
                                  TYPE_LEFT_BORDER[type],
                                  checked
                                    ? "bg-primary/5"
                                    : "bg-background hover:bg-muted/30",
                                ].join(" ")}
                              >
                                {/* Checkbox */}
                                <td className="px-3 py-3">
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={() => toggleItem(item.id)}
                                    className="h-4 w-4 rounded border-border accent-primary"
                                  />
                                </td>

                                {/* Row number badge */}
                                <td className="px-2 py-3">
                                  <span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-[10px] font-bold tabular-nums text-muted-foreground">
                                    {n}
                                  </span>
                                </td>

                                {/* Name + description */}
                                <td className="px-3 py-3">
                                  <p className="font-medium leading-snug">{item.name}</p>
                                  {item.description && (
                                    <p className="mt-0.5 text-xs text-muted-foreground">
                                      {item.description}
                                    </p>
                                  )}
                                </td>

                                {/* Type badge */}
                                <td className="px-3 py-3">
                                  <span
                                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[type]}`}
                                  >
                                    {TYPE_LABEL[type]}
                                  </span>
                                </td>

                                {/* Units included badge */}
                                <td className="px-3 py-3 text-center">
                                  {item.unitsIncluded != null ? (
                                    <span className="inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium tabular-nums">
                                      ≡ {item.unitsIncluded}
                                    </span>
                                  ) : (
                                    <span className="text-muted-foreground">—</span>
                                  )}
                                </td>

                                {/* Price */}
                                <td className="px-3 py-3 text-right">
                                  <span className="font-mono font-semibold tabular-nums">
                                    {formatCurrency(item.amount, activeList?.currencyCode ?? "EUR")}
                                  </span>
                                </td>

                                {/* Lab product */}
                                <td className="px-3 py-3">
                                  {item.labProductId ? (
                                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                      <Wand2 className="h-3.5 w-3.5 shrink-0 text-primary" />
                                      Lab product
                                    </span>
                                  ) : (
                                    <span className="text-xs text-muted-foreground">—</span>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      );
                    })}
                  </tbody>

                  {/* Footer: list metadata */}
                  {activeList && (
                    <tfoot>
                      <tr className="border-t border-border bg-muted/30">
                        <td colSpan={7} className="px-4 py-2">
                          <span className="text-xs text-muted-foreground">
                            {activeList.name} · {activeList.countryCode} · {activeList.currencyCode}
                            {activeList.bulkDiscounts.length > 0
                              ? ` · Bulk discounts: ${activeList.bulkDiscounts
                                  .map((t) => `${t.minQuantity}+ → ${t.discountPercent}% off`)
                                  .join(", ")}`
                              : null}
                          </span>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <PriceListFormSheet
        open={formOpen}
        onOpenChange={setFormOpen}
        priceList={editing}
        schoolId={schoolId}
      />
    </div>
  );
}
