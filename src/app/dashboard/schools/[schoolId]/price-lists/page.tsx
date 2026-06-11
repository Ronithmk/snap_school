"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CheckCircle2,
  ChevronRight,
  Download,
  Loader2,
  Package,
  Pencil,
  Plus,
  RefreshCw,
  Sparkles,
  Star,
  Tag,
  Trash2,
  Wand2,
} from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { PriceListFormSheet } from "@/components/dashboard";
import { usePriceLists, useUpdatePriceList } from "@/hooks/use-pricing";
import { useSchool } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import { ProductMockup } from "@/components/storefront/product-mockup";
import { PRODUCT_MOCKUPS, PRODUCT_MOCKUP_BY_TYPE } from "@/config/product-mockups";
import type { ApiError, PriceItemType, PriceList, PriceListItem } from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

// ── Type config ───────────────────────────────────────────────────

const TYPE_LABEL: Record<PriceItemType, string> = {
  package: "Pack",
  digital_download: "HD File",
  single_print: "Print",
  addon: "Add-on",
};

const TYPE_BADGE: Record<PriceItemType, string> = {
  package: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
  digital_download: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
  single_print: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  addon: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
};

const TYPE_LEFT_BORDER: Record<PriceItemType, string> = {
  package: "border-l-amber-400",
  digital_download: "border-l-blue-400",
  single_print: "border-l-green-400",
  addon: "border-l-orange-400",
};

// ── Grouping ──────────────────────────────────────────────────────

interface ItemGroup { key: string; header: string; subtext?: string; type: PriceItemType; items: PriceListItem[] }

function buildGroups(items: PriceListItem[]): ItemGroup[] {
  const groups: ItemGroup[] = [];
  for (const item of items.filter((i) => i.type === "package")) {
    groups.push({ key: item.id, header: item.name, subtext: item.description, type: "package", items: [item] });
  }
  const singles = items.filter((i) => i.type === "single_print");
  const downloads = items.filter((i) => i.type === "digital_download");
  const addons = items.filter((i) => i.type === "addon");
  if (singles.length) groups.push({ key: "single_print", header: "Individual Prints", type: "single_print", items: singles });
  if (downloads.length) groups.push({ key: "digital_download", header: "Digital Downloads", type: "digital_download", items: downloads });
  if (addons.length) groups.push({ key: "addon", header: "Add-ons", type: "addon", items: addons });
  return groups;
}

// ── Page ──────────────────────────────────────────────────────────

export default function SchoolPriceListsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: priceLists, isLoading, refetch } = usePriceLists(schoolId);
  const updatePriceList = useUpdatePriceList(schoolId);

  const [selectedId, setSelectedId] = useState<string>("");
  const [nameFilter, setNameFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | PriceItemType>("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<PriceList | null>(null);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [addingCommon, setAddingCommon] = useState(false);

  useEffect(() => {
    if (priceLists && priceLists.length > 0 && !selectedId) {
      const def = priceLists.find((p) => p.isDefault) ?? priceLists[0];
      setSelectedId(def.id);
    }
  }, [priceLists, selectedId]);

  useEffect(() => { setSelectedItems(new Set()); }, [selectedId]);

  const activeList = useMemo(() => priceLists?.find((p) => p.id === selectedId) ?? null, [priceLists, selectedId]);

  const filteredItems = useMemo(() =>
    (activeList?.items ?? []).filter((item) => {
      if (nameFilter && !item.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (typeFilter && item.type !== typeFilter) return false;
      return true;
    }), [activeList, nameFilter, typeFilter]);

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

  async function handleMakeDefault(pl: PriceList) {
    try {
      await updatePriceList.mutateAsync({ id: pl.id, input: { isDefault: true } });
      toast.success(`"${pl.name}" is now the default price list.`);
    } catch (err) {
      toast.error((err as unknown as ApiError).message ?? "Couldn't update. Please try again.");
    }
  }

  async function handleAddCommonProducts() {
    if (!activeList) return;
    const existingTypes = new Set(activeList.items.map((i) => i.productType).filter(Boolean));
    const newPresets = PRODUCT_MOCKUPS.filter((p) => !existingTypes.has(p.productType));
    if (newPresets.length === 0) {
      toast.info("All common products are already in this price list.");
      return;
    }
    setAddingCommon(true);
    try {
      const items: Omit<PriceListItem, "id">[] = [
        ...activeList.items.map(({ id: _id, ...rest }) => rest),
        ...newPresets.map((p) => ({
          type: p.type,
          name: p.name,
          description: p.description,
          amount: p.amount,
          unitsIncluded: p.unitsIncluded,
          productType: p.productType,
        })),
      ];
      await updatePriceList.mutateAsync({ id: activeList.id, input: { items } });
      toast.success(`Added ${newPresets.length} common product${newPresets.length === 1 ? "" : "s"}.`);
    } catch (err) {
      toast.error((err as unknown as ApiError).message ?? "Couldn't add products. Please try again.");
    } finally {
      setAddingCommon(false);
    }
  }

  return (
    <div className="space-y-4">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="transition-colors hover:text-foreground">Schools</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={routes.dashboard.school(schoolId)} className="transition-colors hover:text-foreground truncate">
          {school?.name ?? schoolId}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Price lists</span>
      </nav>

      <PageHeader
        title="Price Lists"
        description="Pricing templates and product packs for this school."
        actions={
          <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
            <Plus className="h-4 w-4" />
            New price list
          </Button>
        }
      />

      {isLoading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-72" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      ) : !priceLists || priceLists.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No price lists yet"
          description="Create a price list to define how families are charged for prints and packages."
          action={
            <Button onClick={() => { setEditing(null); setFormOpen(true); }}>
              <Plus className="h-4 w-4" />
              Add price list
            </Button>
          }
        />
      ) : (
        <>
          {/* Price list selector */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} containerClassName="w-72">
              {priceLists.map((pl) => (
                <option key={pl.id} value={pl.id}>{pl.name}{pl.isDefault ? " [Default]" : ""}</option>
              ))}
            </Select>
            {activeList?.isDefault && (
              <Badge variant="positive" className="gap-1 shrink-0"><Star className="h-3 w-3" />Default</Badge>
            )}
            {activeList && !activeList.isDefault && (
              <Button variant="ghost" size="sm" onClick={() => handleMakeDefault(activeList)} disabled={updatePriceList.isPending}>
                {updatePriceList.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Star className="h-3.5 w-3.5" />}
                Make default
              </Button>
            )}
            <div className="ml-auto">
              <Button variant="outline" size="sm" disabled={!activeList}
                onClick={() => { if (activeList) { setEditing(activeList); setFormOpen(true); } }}>
                <Pencil className="h-3.5 w-3.5" />
                Edit list
              </Button>
            </div>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
            <input
              type="text"
              placeholder="Product name…"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="h-8 w-44 rounded-md border border-input bg-background px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
            <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as "" | PriceItemType)} containerClassName="w-40">
              <option value="">All types</option>
              {(Object.entries(TYPE_LABEL) as [PriceItemType, string][]).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </Select>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs tabular-nums text-muted-foreground">
                {filteredItems.length}/{activeList?.items.length ?? 0} products
              </span>
              <Button variant="ghost" size="sm" onClick={() => { setNameFilter(""); setTypeFilter(""); }}>Reset</Button>
              <Button variant="outline" size="sm" onClick={() => refetch()}><RefreshCw className="h-3.5 w-3.5" />Refresh</Button>
            </div>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-3 py-2">
            <Button variant="ghost" size="sm" disabled={selectedItems.size === 0} title="Download"><Download className="h-4 w-4" /></Button>
            <Button variant="ghost" size="sm" disabled={selectedItems.size === 0} title="Delete" className="text-destructive hover:text-destructive"><Trash2 className="h-4 w-4" /></Button>
            <div className="mx-1 h-4 w-px bg-border" />
            {activeList && activeList.items.length > 0 && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                All products configured correctly
              </span>
            )}
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleAddCommonProducts} disabled={!activeList || addingCommon}>
                {addingCommon ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                Add common products
              </Button>
              <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}>
                <Plus className="h-3.5 w-3.5" />Add products
              </Button>
            </div>
          </div>

          {/* Table */}
          {groups.length === 0 ? (
            <EmptyState icon={Package} title="No products found"
              description={nameFilter || typeFilter ? "No products match your filters." : "This price list has no products yet."}
              action={!nameFilter && !typeFilter ? <Button size="sm" onClick={() => { setEditing(null); setFormOpen(true); }}><Plus className="h-4 w-4" />Add products</Button> : undefined}
            />
          ) : (
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/60">
                      <th className="w-10 px-3 py-2.5"><input type="checkbox" checked={allChecked} onChange={toggleAll} className="h-4 w-4 rounded border-border accent-primary" /></th>
                      <th className="w-10 px-2 py-2.5 text-left text-xs font-semibold text-muted-foreground">#</th>
                      <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Product</th>
                      <th className="w-28 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Type</th>
                      <th className="w-20 px-3 py-2.5 text-center text-xs font-semibold text-muted-foreground">Units</th>
                      <th className="w-28 px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">Price</th>
                      <th className="w-36 px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Lab</th>
                    </tr>
                  </thead>
                  <tbody>
                    {groups.map(({ key, header, subtext, type, items }) => {
                      let n = 0;
                      return (
                        <>
                          <tr key={`hdr-${key}`} className="border-y border-border bg-amber-50/60 dark:bg-amber-950/20">
                            <td colSpan={7} className="px-4 py-2">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">{header}</span>
                                {subtext && <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{subtext}</span>}
                                <span className="ml-1 text-xs text-muted-foreground">{items.length} {items.length === 1 ? "product" : "products"}</span>
                              </div>
                            </td>
                          </tr>
                          {items.map((item) => {
                            n += 1;
                            const checked = selectedItems.has(item.id);
                            return (
                              <tr key={item.id} className={["border-b border-border border-l-4 transition-colors last:border-b-0", TYPE_LEFT_BORDER[type], checked ? "bg-primary/5" : "bg-background hover:bg-muted/30"].join(" ")}>
                                <td className="px-3 py-3"><input type="checkbox" checked={checked} onChange={() => toggleItem(item.id)} className="h-4 w-4 rounded border-border accent-primary" /></td>
                                <td className="px-2 py-3"><span className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-[10px] font-bold tabular-nums text-muted-foreground">{n}</span></td>
                                <td className="px-3 py-3">
                                  <div className="flex items-start gap-2">
                                    {item.productType && PRODUCT_MOCKUP_BY_TYPE.has(item.productType) && (
                                      <ProductMockup layout={PRODUCT_MOCKUP_BY_TYPE.get(item.productType)!.layout} className="w-9 shrink-0" />
                                    )}
                                    {!item.productType && item.previewImageUrl && (
                                      // eslint-disable-next-line @next/next/no-img-element
                                      <img src={item.previewImageUrl} alt={item.name} className="h-9 w-9 shrink-0 rounded border border-border object-cover" />
                                    )}
                                    <div>
                                      <p className="font-medium leading-snug">{item.name}</p>
                                      {item.description && <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-3 py-3"><span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${TYPE_BADGE[type]}`}>{TYPE_LABEL[type]}</span></td>
                                <td className="px-3 py-3 text-center">
                                  {item.unitsIncluded != null
                                    ? <span className="inline-flex items-center gap-0.5 rounded-md border border-border bg-muted/60 px-2 py-0.5 text-xs font-medium tabular-nums">≡ {item.unitsIncluded}</span>
                                    : <span className="text-muted-foreground">—</span>}
                                </td>
                                <td className="px-3 py-3 text-right"><span className="font-mono font-semibold tabular-nums">{formatCurrency(item.amount, activeList?.currencyCode ?? "EUR")}</span></td>
                                <td className="px-3 py-3">
                                  {item.labProductId
                                    ? <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Wand2 className="h-3.5 w-3.5 shrink-0 text-primary" />Lab product</span>
                                    : <span className="text-xs text-muted-foreground">—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </>
                      );
                    })}
                  </tbody>
                  {activeList && (
                    <tfoot>
                      <tr className="border-t border-border bg-muted/30">
                        <td colSpan={7} className="px-4 py-2">
                          <span className="text-xs text-muted-foreground">
                            {activeList.name} · {activeList.countryCode} · {activeList.currencyCode}
                            {activeList.bulkDiscounts.length > 0
                              ? ` · Bulk discounts: ${activeList.bulkDiscounts.map((t) => `${t.minQuantity}+ → ${t.discountPercent}% off`).join(", ")}`
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

      <PriceListFormSheet open={formOpen} onOpenChange={setFormOpen} priceList={editing} schoolId={schoolId} />
    </div>
  );
}
