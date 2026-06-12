"use client";

import { useState } from "react";
import Image from "next/image";
import { Heart, Loader2, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { useAlbumPhotos } from "@/hooks/use-albums";
import { useFavoritesStore } from "@/stores/favorites.store";
import { formatCurrency } from "@/config/currency";
import { cn } from "@/lib/utils";
import type { CartLineItem, Photo, PriceList } from "@/types";

interface PhotoGridProps {
  albumId: string;
  priceList: PriceList | null;
  onAddToCart: (item: Omit<CartLineItem, "id">) => void;
}

export function PhotoGrid({ albumId, priceList, onAddToCart }: PhotoGridProps) {
  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAlbumPhotos(albumId);
  // Never show flagged photos on the storefront — 1-album-1-kid rule enforcement
  const photos = (data?.pages.flatMap((page) => page.data) ?? []).filter(
    (p) => p.faceValidationStatus !== "flagged",
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (photos.length === 0) {
    return <EmptyState title="No photos yet" description="Photos for this album haven't been uploaded yet — check back soon." />;
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {photos.map((photo) => (
          <PhotoCard key={photo.id} albumId={albumId} photo={photo} priceList={priceList} onAddToCart={onAddToCart} />
        ))}
      </div>
      {hasNextPage ? (
        <div className="flex justify-center">
          <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
            {isFetchingNextPage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading…
              </>
            ) : (
              "Load more photos"
            )}
          </Button>
        </div>
      ) : null}
    </div>
  );
}

interface PhotoCardProps {
  albumId: string;
  photo: Photo;
  priceList: PriceList | null;
  onAddToCart: (item: Omit<CartLineItem, "id">) => void;
}

function PhotoCard({ albumId, photo, priceList, onAddToCart }: PhotoCardProps) {
  const isFavorite = useFavoritesStore((s) => s.isFavorite(albumId, photo.id));
  const toggleFavorite = useFavoritesStore((s) => s.toggleFavorite);
  const [selectedItemId, setSelectedItemId] = useState(priceList?.items[0]?.id ?? "");

  function handleAddToCart() {
    const item = priceList?.items.find((i) => i.id === selectedItemId);
    if (!item) {
      toast.error("This album doesn't have pricing set up yet.");
      return;
    }
    onAddToCart({
      photoId: photo.id,
      priceListItemId: item.id,
      name: `${photo.fileName} — ${item.name}`,
      unitPrice: item.amount,
      quantity: 1,
      thumbnailUrl: photo.thumbnailUrl,
    });
    toast.success("Added to cart");
  }

  return (
    <figure className="group relative aspect-square overflow-hidden rounded-lg bg-muted" data-testid="photo-card" data-photo-id={photo.id}>
      <Image
        src={photo.thumbnailUrl}
        alt={photo.fileName}
        fill
        loading="lazy"
        sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
        className="object-cover transition-transform duration-300 group-hover:scale-105"
      />

      <button
        type="button"
        onClick={() => toggleFavorite(albumId, photo.id)}
        aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={isFavorite}
        className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
      >
        <Heart className={cn("h-4 w-4", isFavorite && "fill-red-500 text-red-500")} />
      </button>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2.5">
        {priceList && priceList.items.length > 0 ? (
          <div className="space-y-1.5">
            <Select
              value={selectedItemId}
              onChange={(e) => setSelectedItemId(e.target.value)}
              className="h-8 border-white/20 bg-black/40 text-xs text-white [&>option]:text-foreground"
              aria-label="Choose a product"
            >
              {priceList.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name} — {formatCurrency(item.amount, priceList.currencyCode)}
                </option>
              ))}
            </Select>
            <Button size="sm" className="h-8 w-full" data-testid="add-to-cart-button" onClick={handleAddToCart}>
              <ShoppingCart className="h-3.5 w-3.5" />
              Add to cart
            </Button>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
