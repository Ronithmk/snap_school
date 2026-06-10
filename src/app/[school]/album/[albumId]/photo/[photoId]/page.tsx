"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronRight, Minus, Plus, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { WatermarkOverlay } from "@/components/storefront/watermark-overlay";
import { useAlbum, usePhoto } from "@/hooks/use-albums";
import { useAlbumCart } from "@/hooks/use-cart";
import { useDefaultPriceListForSchool, usePriceLists } from "@/hooks/use-pricing";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { PriceListItem } from "@/types";

interface PhotoStorefrontPageProps {
  params: Promise<{ school: string; albumId: string; photoId: string }>;
}

export default function PhotoStorefrontPage({ params }: PhotoStorefrontPageProps) {
  const { school: schoolSlug, albumId, photoId } = use(params);

  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(schoolSlug);
  const { data: album, isLoading: isAlbumLoading } = useAlbum(albumId);
  const { data: photo, isLoading: isPhotoLoading } = usePhoto(photoId);
  const { data: priceLists } = usePriceLists(school?.id);
  const { data: defaultPriceList } = useDefaultPriceListForSchool(school?.id);
  const { cart, addItem, removeItem, updateQuantity } = useAlbumCart(school, albumId);

  const [selectedItemId, setSelectedItemId] = useState("");

  const priceList = useMemo(() => {
    if (!album) return null;
    if (album.pricing.priceListId) {
      return priceLists?.find((l) => l.id === album.pricing.priceListId) ?? defaultPriceList ?? null;
    }
    return defaultPriceList ?? null;
  }, [album, priceLists, defaultPriceList]);

  // Only show products that apply to this photo's category (uncategorized items apply to every photo)
  const items = useMemo(() => {
    if (!priceList) return [];
    return priceList.items.filter((item) => !item.category || item.category === photo?.category);
  }, [priceList, photo]);

  useEffect(() => {
    if (items.length && !selectedItemId) {
      setSelectedItemId(items[0].id);
    }
  }, [items, selectedItemId]);

  const selectedItem = items.find((i) => i.id === selectedItemId) ?? items[0] ?? null;
  const currencyCode = priceList?.currencyCode ?? school?.settings.currencyCode ?? "EUR";

  function getItemQty(priceListItemId: string): number {
    return cart?.items
      .filter((i) => i.priceListItemId === priceListItemId && i.photoId === photoId)
      .reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }

  function setItemQty(item: PriceListItem, newQty: number) {
    const lines = cart?.items.filter((i) => i.priceListItemId === item.id && i.photoId === photoId) ?? [];
    if (newQty <= 0) {
      lines.forEach((line) => removeItem(line.id));
    } else if (lines.length === 0) {
      addItem({
        photoId,
        priceListItemId: item.id,
        name: item.name,
        unitPrice: item.amount,
        quantity: newQty,
        thumbnailUrl: photo?.thumbnailUrl ?? item.previewImageUrl ?? album?.coverImageUrl ?? "",
      });
    } else {
      updateQuantity(lines[0].id, newQty);
      lines.slice(1).forEach((line) => removeItem(line.id));
    }
  }

  const totalItems = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) ?? 0;

  if (!isPhotoLoading && photo === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Photo not found" description="This photo may have been removed." />
      </div>
    );
  }

  if (isSchoolLoading || isAlbumLoading || isPhotoLoading || !school || !album || !photo) {
    return <LoadingSkeleton />;
  }

  if (!priceList || items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="No products available" description="There aren't any products set up for this photo yet. Check back soon." />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100svh-64px)] overflow-hidden">
      {/* ── Center photo preview ── */}
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <nav className="absolute left-4 top-3 flex items-center gap-1 text-xs text-neutral-500">
          <Link href={routes.storefront.school(schoolSlug)} className="hover:text-foreground transition-colors">
            {school.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <Link href={routes.storefront.album(schoolSlug, albumId)} className="hover:text-foreground transition-colors">
            {album.title}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="text-neutral-700 dark:text-neutral-300">Photo</span>
        </nav>

        <PhotoPreview photo={photo} item={selectedItem} watermark={school.settings?.watermark} />
      </main>

      {/* ── Right price list panel ── */}
      <aside className="flex w-[272px] flex-shrink-0 flex-col border-l border-border bg-background">
        <div className="border-b border-border p-3">
          <p className="text-xs font-medium text-muted-foreground">Products for this photo</p>
        </div>
        <div className="flex-1 divide-y divide-border overflow-y-auto">
          {items.map((item) => {
            const qty = getItemQty(item.id);
            const isSelected = item.id === selectedItemId;
            return (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => setSelectedItemId(item.id)}
                onKeyDown={(e) => e.key === "Enter" && setSelectedItemId(item.id)}
                className={cn(
                  "group flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isSelected && "bg-primary/5",
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium leading-snug", isSelected && "text-primary")}>
                    {item.name}
                  </p>
                  {item.description ? (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>

                <div className="flex items-center gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={qty === 0}
                    onClick={() => setItemQty(item, qty - 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    <Minus className="h-2.5 w-2.5" />
                  </button>
                  <span className="w-5 text-center text-sm tabular-nums">{qty}</span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setItemQty(item, qty + 1)}
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>

                <p className="w-14 shrink-0 text-right text-sm font-semibold">
                  {formatCurrency(item.amount, currencyCode)}
                </p>
              </div>
            );
          })}
        </div>

        <div className="border-t border-border p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({totalItems} article{totalItems !== 1 ? "s" : ""})
            </span>
            <span className="font-bold">{formatCurrency(subtotal, currencyCode)}</span>
          </div>
          <Link
            href={routes.storefront.cart(schoolSlug, albumId)}
            className={cn(
              buttonVariants({ variant: totalItems > 0 ? "default" : "outline" }),
              "w-full justify-center",
            )}
          >
            <ShoppingCart className="h-4 w-4" />
            View Cart
          </Link>
        </div>
      </aside>
    </div>
  );
}

// ── Photo Preview ────────────────────────────────────────────────────────────

function PhotoPreview({
  photo,
  item,
  watermark,
}: {
  photo: { previewUrl: string; fileName: string };
  item: PriceListItem | null;
  watermark?: import("@/types/tenant").WatermarkSettings;
}) {
  return (
    <div className="flex max-w-2xl flex-col items-center gap-5 px-8 py-6 text-center">
      <div data-protected className="relative w-full max-w-[480px] overflow-hidden rounded-lg shadow-2xl">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photo.previewUrl}
          alt={photo.fileName}
          draggable={false}
          className="w-full select-none object-contain"
          style={{ maxHeight: "58vh" }}
          onDragStart={(e) => e.preventDefault()}
        />
        <WatermarkOverlay watermark={watermark} />
      </div>

      {item ? (
        <div>
          <p className="text-xl font-semibold tracking-tight">{item.name}</p>
          {item.description ? (
            <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex h-[calc(100svh-64px)] overflow-hidden">
      <div className="flex flex-1 items-center justify-center bg-neutral-100 dark:bg-neutral-900">
        <Skeleton className="h-[50vh] w-[36vw] rounded-lg" />
      </div>
      <div className="w-[272px] border-l bg-background">
        <div className="divide-y">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-3 py-3">
              <Skeleton className="h-4 flex-1" />
              <Skeleton className="h-6 w-20" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
