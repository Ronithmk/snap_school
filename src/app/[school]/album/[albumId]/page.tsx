"use client";

import { use, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Minus, Plus, Search, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { WatermarkOverlay } from "@/components/storefront/watermark-overlay";
import { ProductMockup } from "@/components/storefront/product-mockup";
import { useAlbum, useAlbumPhotos } from "@/hooks/use-albums";
import { useAlbumCart } from "@/hooks/use-cart";
import { useDefaultPriceListForSchool, usePriceLists } from "@/hooks/use-pricing";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { hasAlbumAccess } from "@/lib/album-access";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import { PRODUCT_MOCKUP_BY_TYPE } from "@/config/product-mockups";
import { cn } from "@/lib/utils";
import type { PriceListItem } from "@/types";
import type { WatermarkSettings } from "@/types/tenant";

interface AlbumGalleryPageProps {
  params: Promise<{ school: string; albumId: string }>;
}

export default function AlbumGalleryPage({ params }: AlbumGalleryPageProps) {
  const { school: schoolSlug, albumId } = use(params);
  const router = useRouter();

  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(schoolSlug);
  const { data: album, isLoading: isAlbumLoading } = useAlbum(albumId);
  const { data: priceLists } = usePriceLists(school?.id);
  const { data: defaultPriceList } = useDefaultPriceListForSchool(school?.id);
  const { cart, addItem, removeItem, updateQuantity } = useAlbumCart(school, albumId);
  const { data: photoPages } = useAlbumPhotos(albumId);

  const [accessChecked, setAccessChecked] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState("");

  useEffect(() => {
    if (!album) return;
    if (album.passwordProtected && !hasAlbumAccess(album.id)) {
      router.replace(routes.storefront.albumAccess(schoolSlug, albumId));
      return;
    }
    setAccessChecked(true);
  }, [album, albumId, router, schoolSlug]);

  const priceList = useMemo(() => {
    if (!album) return null;
    if (album.pricing.priceListId) {
      return priceLists?.find((l) => l.id === album.pricing.priceListId) ?? defaultPriceList ?? null;
    }
    return defaultPriceList ?? null;
  }, [album, priceLists, defaultPriceList]);

  // Auto-select first item when price list loads
  useEffect(() => {
    if (priceList?.items.length && !selectedItemId) {
      setSelectedItemId(priceList.items[0].id);
    }
  }, [priceList, selectedItemId]);

  const selectedItem = priceList?.items.find((i) => i.id === selectedItemId) ?? priceList?.items[0] ?? null;
  const currencyCode = priceList?.currencyCode ?? school?.settings.currencyCode ?? "EUR";

  // Photo used to render dynamic product mockups — falls back to the album's first photo
  // when no cover photo has been set, so each kid's products show their own photo.
  const firstPhoto = photoPages?.pages[0]?.data[0];
  const mockupPhotoUrl = album?.coverImageUrl || firstPhoto?.previewUrl || firstPhoto?.thumbnailUrl || "";

  function getItemQty(priceListItemId: string): number {
    return cart?.items
      .filter((i) => i.priceListItemId === priceListItemId)
      .reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  }

  function setItemQty(item: PriceListItem, newQty: number) {
    const lines = cart?.items.filter((i) => i.priceListItemId === item.id) ?? [];
    if (newQty <= 0) {
      lines.forEach((line) => removeItem(line.id));
    } else if (lines.length === 0) {
      addItem({
        photoId: null,
        priceListItemId: item.id,
        name: item.name,
        unitPrice: item.amount,
        quantity: newQty,
        thumbnailUrl: item.previewImageUrl ?? mockupPhotoUrl,
      });
    } else {
      updateQuantity(lines[0].id, newQty);
      // Remove excess lines if any
      lines.slice(1).forEach((line) => removeItem(line.id));
    }
  }

  const totalItems = cart?.items.reduce((sum, i) => sum + i.quantity, 0) ?? 0;
  const subtotal = cart?.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) ?? 0;

  // Items in the left strip = price list items that have qty > 0
  const cartItems = useMemo(() => {
    if (!cart || !priceList) return [];
    return priceList.items.filter((item) => {
      return cart.items.some((ci) => ci.priceListItemId === item.id && ci.quantity > 0);
    });
  }, [cart, priceList]);

  if (!isAlbumLoading && album === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Album not found" description="This album may have been removed or made private." />
      </div>
    );
  }

  if (isSchoolLoading || isAlbumLoading || !school || !album || !accessChecked) {
    return <LoadingSkeleton />;
  }

  if (!priceList || priceList.items.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="No products available" description="This album doesn't have any products set up yet. Check back soon." />
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:h-[calc(100svh-64px)] lg:flex-row lg:overflow-hidden">
      {/* ── Left thumbnail strip ── */}
      <aside className="hidden w-[88px] flex-shrink-0 flex-col gap-1 overflow-y-auto border-r border-border bg-background p-1.5 lg:flex">
        {cartItems.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-1 pt-6 text-center">
            <ShoppingCart className="h-5 w-5 text-muted-foreground/30" />
            <p className="text-[9px] leading-tight text-muted-foreground/60">Add items to see them here</p>
          </div>
        ) : (
          cartItems.map((item) => {
            const mockup = item.productType ? PRODUCT_MOCKUP_BY_TYPE.get(item.productType) : undefined;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedItemId(item.id)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg p-1.5 text-center transition-colors hover:bg-accent",
                  selectedItemId === item.id && "ring-2 ring-primary/60 bg-primary/5",
                )}
              >
                <div className="relative aspect-square w-full overflow-hidden rounded-md bg-muted">
                  {mockup ? (
                    <ProductMockup layout={mockup.layout} photoUrl={mockupPhotoUrl} className="h-full" />
                  ) : (
                    <Image src={item.previewImageUrl || mockupPhotoUrl} alt={item.name} fill sizes="88px" className="object-cover" />
                  )}
                </div>
                <span className="line-clamp-2 text-[9px] leading-tight text-muted-foreground">{item.name}</span>
              </button>
            );
          })
        )}
      </aside>

      {/* ── Center product preview ── */}
      <main className="relative flex flex-1 flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-neutral-100 via-neutral-50 to-neutral-100 pt-10 dark:from-neutral-950 dark:via-neutral-900 dark:to-neutral-950 lg:pt-0">
        <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-primary/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
        {/* Breadcrumb */}
        <nav className="absolute left-4 top-3 z-10 flex items-center gap-1 rounded-full bg-background/70 px-3 py-1 text-xs text-neutral-500 shadow-sm backdrop-blur">
          <Link href={routes.storefront.school(schoolSlug)} className="hover:text-foreground transition-colors">
            {school.name}
          </Link>
          <ChevronRight className="h-3 w-3" />
          <span className="font-medium text-neutral-700 dark:text-neutral-300">{album.title}</span>
        </nav>

        {selectedItem ? (
          <ProductPreview
            item={selectedItem}
            coverUrl={mockupPhotoUrl}
            watermark={school.settings?.watermark}
          />
        ) : null}
      </main>

      {/* ── Right price list panel ── */}
      <aside className="flex w-full flex-col border-t border-border bg-background lg:w-[272px] lg:flex-shrink-0 lg:border-l lg:border-t-0">
        {/* Header */}
        <div className="border-b border-border px-4 py-3">
          <p className="text-sm font-semibold tracking-tight">Products &amp; prints</p>
          <p className="text-xs text-muted-foreground">Pick what you&apos;d like for {album.title}</p>
        </div>
        {/* Scrollable item rows */}
        <div className="divide-y divide-border lg:flex-1 lg:overflow-y-auto">
          {priceList.items.map((item) => {
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
                  "group relative flex cursor-pointer items-center gap-2 px-3 py-2.5 transition-colors hover:bg-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50",
                  isSelected && "bg-primary/5",
                  qty > 0 && "bg-emerald-50/60 dark:bg-emerald-900/10",
                )}
              >
                {isSelected && <span className="absolute inset-y-0 left-0 w-0.5 bg-primary" />}
                {/* Name + description */}
                <div className="min-w-0 flex-1">
                  <p className={cn("text-sm font-medium leading-snug", isSelected && "text-primary")}>
                    {item.name}
                  </p>
                  {item.description ? (
                    <p className="line-clamp-1 text-[11px] text-muted-foreground">{item.description}</p>
                  ) : null}
                </div>

                {/* Qty stepper */}
                <div
                  className="flex items-center gap-0.5"
                  onClick={(e) => e.stopPropagation()}
                >
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
                    className="flex h-6 w-6 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Plus className="h-2.5 w-2.5" />
                  </button>
                </div>

                {/* Price */}
                <p className={cn("w-14 shrink-0 text-right text-sm font-semibold tabular-nums", qty > 0 && "text-primary")}>
                  {formatCurrency(item.amount, currencyCode)}
                </p>

                {/* Preview magnifier */}
                <button
                  type="button"
                  aria-label="Preview"
                  title="Preview"
                  onClick={(e) => { e.stopPropagation(); setSelectedItemId(item.id); }}
                  className="shrink-0 text-muted-foreground/40 transition-all hover:text-primary group-hover:opacity-100 opacity-0"
                >
                  <Search className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}
        </div>

        {/* Subtotal + View Cart */}
        <div className="border-t border-border bg-muted/30 p-4">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              Subtotal ({totalItems} article{totalItems !== 1 ? "s" : ""})
            </span>
            <span className="text-base font-bold">{formatCurrency(subtotal, currencyCode)}</span>
          </div>
          <Link
            href={routes.storefront.cart(schoolSlug, albumId)}
            className={cn(
              buttonVariants({ variant: totalItems > 0 ? "default" : "outline" }),
              "w-full justify-center shadow-sm",
              totalItems > 0 && "shadow-primary/20",
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

// ── Product Preview ──────────────────────────────────────────────────────────

function ProductPreview({
  item,
  coverUrl,
  watermark,
}: {
  item: PriceListItem;
  coverUrl: string;
  watermark?: WatermarkSettings;
}) {
  const imageUrl = item.previewImageUrl ?? coverUrl;
  const mockup = item.productType ? PRODUCT_MOCKUP_BY_TYPE.get(item.productType) : undefined;

  return (
    <div className="flex max-w-2xl flex-col items-center gap-5 px-4 py-6 text-center sm:px-8">
      {/* Mockup image */}
      <div
        data-protected
        className="relative w-full max-w-[320px] overflow-hidden rounded-lg shadow-2xl"
        style={mockup ? undefined : { maxWidth: "480px" }}
      >
        {mockup ? (
          <ProductMockup layout={mockup.layout} photoUrl={coverUrl} />
        ) : (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt={item.name}
            draggable={false}
            className="w-full select-none object-contain"
            style={{ maxHeight: "58vh" }}
            onDragStart={(e) => e.preventDefault()}
          />
        )}
        <WatermarkOverlay watermark={watermark} />
      </div>

      {/* Product name + description */}
      <div>
        <p className="text-xl font-semibold tracking-tight">{item.name}</p>
        {item.description ? (
          <p className="mt-1 text-sm text-muted-foreground">{item.description}</p>
        ) : null}
      </div>
    </div>
  );
}

// ── Loading skeleton ─────────────────────────────────────────────────────────

function LoadingSkeleton() {
  return (
    <div className="flex flex-col lg:h-[calc(100svh-64px)] lg:flex-row lg:overflow-hidden">
      <div className="hidden w-[88px] border-r bg-background p-1.5 lg:block">
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-md" />
          ))}
        </div>
      </div>
      <div className="flex flex-1 items-center justify-center bg-neutral-100 py-10 dark:bg-neutral-900 lg:py-0">
        <Skeleton className="h-[40vh] w-[80vw] rounded-lg lg:h-[50vh] lg:w-[36vw]" />
      </div>
      <div className="w-full border-t bg-background lg:w-[272px] lg:border-l lg:border-t-0">
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
