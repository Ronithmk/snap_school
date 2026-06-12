"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderSummary } from "@/components/storefront/order-summary";
import { useAlbum } from "@/hooks/use-albums";
import { useAlbumCart } from "@/hooks/use-cart";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";

interface AlbumCartPageProps {
  params: Promise<{ school: string; albumId: string }>;
}

export default function AlbumCartPage({ params }: AlbumCartPageProps) {
  const { school: schoolSlug, albumId } = use(params);
  const router = useRouter();
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(schoolSlug);
  const { data: album, isLoading: isAlbumLoading } = useAlbum(albumId);
  const { cart, totals, currencyCode, removeItem, updateQuantity, applyCoupon, removeCoupon } = useAlbumCart(school, albumId);

  if (isSchoolLoading || isAlbumLoading || !school || !album) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-56" />
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-64 lg:col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.storefront.school(schoolSlug)} className="transition-colors hover:text-foreground">
          {school.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={routes.storefront.album(schoolSlug, albumId)} className="truncate transition-colors hover:text-foreground">
          {album.title}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Cart</span>
      </nav>

      <PageHeader title="Your cart" description={`Reviewing photos selected from “${album.title}”.`} />

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse the gallery and add photos to your cart to get started."
          action={
            <Link href={routes.storefront.album(schoolSlug, albumId)} className={buttonVariants({ variant: "default" })}>
              Browse photos
            </Link>
          }
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {cart.items.map((item) => (
              <Card key={item.id} className="border-border/60 transition-shadow hover:shadow-sm">
                <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4">
                  <div className="flex items-center gap-3 sm:flex-1 sm:gap-4">
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
                      <Image src={item.thumbnailUrl} alt={item.name} fill sizes="64px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className="truncate text-sm font-medium">{item.name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(item.unitPrice, currencyCode)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3 sm:justify-end sm:gap-4">
                    <div className="flex items-center gap-1.5 rounded-full border border-border bg-muted/40 p-0.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease quantity">
                        <Minus className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase quantity">
                        <Plus className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <p className="w-20 shrink-0 text-right text-sm font-semibold tabular-nums">{formatCurrency(item.unitPrice * item.quantity, currencyCode)}</p>
                    <Button variant="ghost" size="icon" className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeItem(item.id)} aria-label="Remove item">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="space-y-4 lg:sticky lg:top-20 lg:self-start">
            <Card className="border-border/60 shadow-sm">
              <CardContent className="space-y-4 p-5">
                <p className="text-sm font-semibold tracking-tight">Order summary</p>
                <CouponField
                  appliedCode={cart.coupon?.code ?? null}
                  onApply={(code) => applyCoupon({ code, discountPercent: 10 })}
                  onRemove={removeCoupon}
                />
                {totals ? <OrderSummary totals={totals} currencyCode={currencyCode} taxLabel={school.settings.tax.label || "Tax"} /> : null}
                <Button className="w-full shadow-sm shadow-primary/20" size="lg" onClick={() => router.push(routes.storefront.checkout(schoolSlug, albumId))}>
                  Proceed to checkout
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

function CouponField({ appliedCode, onApply, onRemove }: { appliedCode: string | null; onApply: (code: string) => void; onRemove: () => void }) {
  if (appliedCode) {
    return (
      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm">
        <span className="inline-flex items-center gap-2">
          Coupon <Badge variant="positive">{appliedCode}</Badge>
        </span>
        <button type="button" onClick={onRemove} className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          Remove
        </button>
      </div>
    );
  }

  return (
    <form
      className="flex gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem("coupon") as HTMLInputElement;
        if (input.value.trim()) {
          onApply(input.value.trim().toUpperCase());
          form.reset();
        }
      }}
    >
      <Input name="coupon" placeholder="Coupon code" className="h-9" aria-label="Coupon code" />
      <Button type="submit" variant="outline" size="sm" className="h-9 shrink-0">
        Apply
      </Button>
    </form>
  );
}
