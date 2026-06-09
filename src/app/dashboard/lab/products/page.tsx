"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Archive, Copy, Loader2, Package, Pencil, Plus, Search, Trash2, Wand2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { LabProductFormSheet } from "@/components/dashboard";
import { useLabStore } from "@/stores/lab.store";
import {
  useDeleteLabProduct,
  useDuplicateLabProduct,
  useLabProducts,
  useUpdateLabProduct,
} from "@/hooks/use-lab";
import { LAB_PRODUCT_STATUS_LABELS, LAB_PRODUCT_STATUS_TONES, LAB_PRODUCT_TYPE_LABELS } from "@/config/constants";
import { routes } from "@/config/routes";
import { formatCurrency } from "@/config/currency";
import type { ApiError, LabProduct, LabProductStatus, LabProductType } from "@/types";

const ALL = "__all__";

export default function LabProductsPage() {
  const { activeSchoolId } = useLabStore();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>(ALL);
  const [type, setType] = useState<string>(ALL);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<LabProduct | null>(null);

  const { data: result, isLoading } = useLabProducts(activeSchoolId ?? undefined, {
    search: search || undefined,
    status: status === ALL ? undefined : (status as LabProductStatus),
    type: type === ALL ? undefined : (type as LabProductType),
    page,
  });

  const updateProduct = useUpdateLabProduct(activeSchoolId ?? undefined);
  const duplicateProduct = useDuplicateLabProduct(activeSchoolId ?? undefined);
  const deleteProduct = useDeleteLabProduct(activeSchoolId ?? undefined);

  const products = result?.data ?? [];

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(product: LabProduct) {
    setEditing(product);
    setFormOpen(true);
  }

  async function handleStatusChange(product: LabProduct, newStatus: LabProductStatus) {
    try {
      await updateProduct.mutateAsync({ id: product.id, input: { status: newStatus } });
      toast.success(`"${product.name}" marked as ${LAB_PRODUCT_STATUS_LABELS[newStatus].toLowerCase()}.`);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't update status.");
    }
  }

  async function handleDuplicate(product: LabProduct) {
    try {
      await duplicateProduct.mutateAsync(product.id);
      toast.success(`"${product.name}" duplicated.`);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't duplicate.");
    }
  }

  async function handleDelete(product: LabProduct) {
    try {
      await deleteProduct.mutateAsync(product.id);
      toast.success(`"${product.name}" deleted.`);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't delete.");
    }
  }

  if (!activeSchoolId) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Library" description="Create and manage printable photo products." />
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Wand2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Select a school from the{" "}
            <Link href={routes.dashboard.lab()} className="text-primary underline-offset-2 hover:underline">
              Lab overview
            </Link>{" "}
            first.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Library"
        description="Create, edit, and publish printable photo products for this school."
        actions={
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            New product
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search products…"
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          containerClassName="sm:w-44"
          aria-label="Filter by status"
        >
          <option value={ALL}>All statuses</option>
          {(Object.keys(LAB_PRODUCT_STATUS_LABELS) as LabProductStatus[]).map((v) => (
            <option key={v} value={v}>{LAB_PRODUCT_STATUS_LABELS[v]}</option>
          ))}
        </Select>
        <Select
          value={type}
          onChange={(e) => { setType(e.target.value); setPage(1); }}
          containerClassName="sm:w-52"
          aria-label="Filter by type"
        >
          <option value={ALL}>All types</option>
          {(Object.keys(LAB_PRODUCT_TYPE_LABELS) as LabProductType[]).map((v) => (
            <option key={v} value={v}>{LAB_PRODUCT_TYPE_LABELS[v]}</option>
          ))}
        </Select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No products found"
          description="Try a different search or filter, or create your first product."
          action={
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              New product
            </Button>
          }
        />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onEdit={openEdit}
                onDuplicate={handleDuplicate}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
                isBusy={updateProduct.isPending || duplicateProduct.isPending || deleteProduct.isPending}
              />
            ))}
          </div>

          {result && result.meta.totalPages > 1 ? (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Page {result.meta.page} of {result.meta.totalPages} · {result.meta.total} products
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={result.meta.page <= 1}>
                  Previous
                </Button>
                <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(result.meta.totalPages, p + 1))} disabled={result.meta.page >= result.meta.totalPages}>
                  Next
                </Button>
              </div>
            </div>
          ) : null}
        </>
      )}

      {activeSchoolId ? (
        <LabProductFormSheet open={formOpen} onOpenChange={setFormOpen} schoolId={activeSchoolId} product={editing} />
      ) : null}
    </div>
  );
}

interface ProductCardProps {
  product: LabProduct;
  onEdit: (p: LabProduct) => void;
  onDuplicate: (p: LabProduct) => void;
  onDelete: (p: LabProduct) => void;
  onStatusChange: (p: LabProduct, s: LabProductStatus) => void;
  isBusy: boolean;
}

function ProductCard({ product, onEdit, onDuplicate, onDelete, onStatusChange, isBusy }: ProductCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <Card className="group overflow-hidden">
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.previewImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.previewImageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Package className="h-10 w-10" />
          </div>
        )}
        <Badge variant={LAB_PRODUCT_STATUS_TONES[product.status]} className="absolute right-2 top-2 text-[10px]">
          {LAB_PRODUCT_STATUS_LABELS[product.status]}
        </Badge>
      </div>

      <CardContent className="space-y-3 p-3">
        <div>
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-xs text-muted-foreground">
            {LAB_PRODUCT_TYPE_LABELS[product.type]} · {product.dimensions.label}
          </p>
          <p className="text-xs font-medium">{formatCurrency(product.price, product.currencyCode)}</p>
        </div>

        <div className="flex flex-wrap gap-1.5">
          <Link
            href={routes.dashboard.labEditor(product.id)}
            className={buttonVariants({ variant: "default", size: "sm", className: "flex-1 text-xs" })}
          >
            <Wand2 className="h-3 w-3" />
            Editor
          </Link>
          <Button variant="outline" size="sm" className="text-xs" onClick={() => onEdit(product)} disabled={isBusy}>
            <Pencil className="h-3 w-3" />
          </Button>
          <Button variant="outline" size="sm" className="text-xs" title="Duplicate" onClick={() => onDuplicate(product)} disabled={isBusy}>
            <Copy className="h-3 w-3" />
          </Button>
          {product.status !== "archived" ? (
            <Button variant="outline" size="sm" className="text-xs" title="Archive" onClick={() => onStatusChange(product, "archived")} disabled={isBusy}>
              <Archive className="h-3 w-3" />
            </Button>
          ) : null}
          {product.status === "draft" ? (
            <Button variant="outline" size="sm" className="text-xs text-positive" onClick={() => onStatusChange(product, "published")} disabled={isBusy}>
              Publish
            </Button>
          ) : null}
        </div>

        {confirmDelete ? (
          <div className="flex gap-1.5">
            <Button variant="destructive" size="sm" className="flex-1 text-xs" onClick={() => { onDelete(product); setConfirmDelete(false); }} disabled={isBusy}>
              {isBusy ? <Loader2 className="h-3 w-3 animate-spin" /> : <Trash2 className="h-3 w-3" />}
              Confirm
            </Button>
            <Button variant="ghost" size="sm" className="text-xs" onClick={() => setConfirmDelete(false)}>
              Cancel
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="sm" className="w-full text-xs text-destructive hover:text-destructive" onClick={() => setConfirmDelete(true)}>
            <Trash2 className="h-3 w-3" />
            Delete
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
