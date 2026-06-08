"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PhotoGrid } from "@/components/storefront/photo-grid";
import { useAlbum } from "@/hooks/use-albums";
import { useAlbumCart } from "@/hooks/use-cart";
import { useDefaultPriceListForCountry, usePriceLists } from "@/hooks/use-pricing";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { hasAlbumAccess } from "@/lib/album-access";
import { cn } from "@/lib/utils";
import { routes } from "@/config/routes";

interface AlbumGalleryPageProps {
  params: Promise<{ school: string; albumId: string }>;
}

export default function AlbumGalleryPage({ params }: AlbumGalleryPageProps) {
  const { school: schoolSlug, albumId } = use(params);
  const router = useRouter();
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(schoolSlug);
  const { data: album, isLoading: isAlbumLoading } = useAlbum(albumId);
  const { data: priceLists } = usePriceLists();
  const { data: defaultPriceList } = useDefaultPriceListForCountry(school?.settings.countryCode);
  const { cart, addItem } = useAlbumCart(school, albumId);

  const [accessChecked, setAccessChecked] = useState(false);

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
      return priceLists?.find((list) => list.id === album.pricing.priceListId) ?? defaultPriceList ?? null;
    }
    return defaultPriceList ?? null;
  }, [album, priceLists, defaultPriceList]);

  const itemCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;

  if (!isAlbumLoading && album === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Album not found" description="This album may have been removed, renamed, or made private." />
      </div>
    );
  }

  if (isSchoolLoading || isAlbumLoading || !school || !album || !accessChecked) {
    return (
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-3">
          <Skeleton className="aspect-[3/1] w-full rounded-xl" />
          <Skeleton className="h-7 w-72" />
          <Skeleton className="h-4 w-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.storefront.school(schoolSlug)} className="transition-colors hover:text-foreground">
          {school.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{album.title}</span>
      </nav>

      <div className="relative aspect-[3/1] w-full overflow-hidden rounded-xl bg-muted">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={album.coverImageUrl} alt={album.title} className="h-full w-full object-cover" />
      </div>
      <PageHeader
        title={album.title}
        description={[album.description, `${album.photoCount} photos`].filter(Boolean).join(" · ")}
        actions={
          <Link
            href={routes.storefront.cart(schoolSlug, albumId)}
            className={cn(buttonVariants({ variant: itemCount > 0 ? "default" : "outline" }), "relative")}
          >
            <ShoppingCart className="h-4 w-4" />
            View cart
            {itemCount > 0 ? (
              <Badge variant="default" className="ml-1 h-5 min-w-5 justify-center rounded-full px-1.5 text-xs">
                {itemCount}
              </Badge>
            ) : null}
          </Link>
        }
      />

      <PhotoGrid albumId={albumId} priceList={priceList} onAddToCart={addItem} />
    </div>
  );
}
