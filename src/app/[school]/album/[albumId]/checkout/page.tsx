"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Banknote, CheckCircle2, ChevronRight, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { OrderSummary } from "@/components/storefront/order-summary";
import { useAlbum } from "@/hooks/use-albums";
import { useAlbumCart } from "@/hooks/use-cart";
import { useCreateOrder, useCreateRazorpayOrder, useVerifyPayment } from "@/hooks/use-orders";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { SHIPPING_OPTIONS } from "@/config/constants";
import { formatCurrency } from "@/config/currency";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { openRazorpayCheckout } from "@/lib/razorpay-checkout";
import type { ApiError, Order, PaymentMethod, ShippingAddress, ShippingMethodId } from "@/types";

interface CheckoutPageProps {
  params: Promise<{ school: string; albumId: string }>;
}

const REQUIRES_ADDRESS: ShippingMethodId[] = ["standard_print", "express_print"];

export default function CheckoutPage({ params }: CheckoutPageProps) {
  const { school: schoolSlug, albumId } = use(params);
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(schoolSlug);
  const { data: album, isLoading: isAlbumLoading } = useAlbum(albumId);
  const { cart, totals, currencyCode, setShippingMethod, clearCart } = useAlbumCart(school, albumId);
  const createOrder = useCreateOrder();
  const createRazorpayOrder = useCreateRazorpayOrder();
  const verifyPayment = useVerifyPayment();

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [address, setAddress] = useState<Omit<ShippingAddress, "countryCode">>({
    fullName: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postalCode: "",
    phone: "",
  });
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  const shippingMethodId = cart?.shippingMethodId ?? null;
  const needsAddress = !!shippingMethodId && REQUIRES_ADDRESS.includes(shippingMethodId);
  const isSubmitting = createOrder.isPending || createRazorpayOrder.isPending || isProcessingPayment;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!school || !album || !cart || !totals) return;

    const orderInput = {
      schoolId: school.id,
      schoolName: school.name,
      albumId: album.id,
      albumTitle: album.title,
      items: cart.items,
      totals: {
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        currencyCode,
      },
      shippingMethodId,
      shippingAddress: needsAddress ? { ...address, countryCode: school.settings.countryCode } : null,
      customerName,
      customerEmail,
      countryCode: school.settings.countryCode,
      paymentMethod,
    };

    if (paymentMethod === "cod") {
      createOrder.mutate(orderInput, {
        onSuccess: (order) => {
          setPlacedOrder(order);
          clearCart();
          toast.success("Order placed! A confirmation has been sent to your email.");
        },
        onError: (err) => toast.error((err as unknown as ApiError).message ?? "Couldn't place your order. Please try again."),
      });
      return;
    }

    // Pay online via Razorpay (card / UPI / netbanking).
    try {
      const result = await createRazorpayOrder.mutateAsync(orderInput);
      if (!result.razorpayKeyId || !result.razorpayOrderId) {
        toast.error("Online payments aren't set up yet. Please choose Cash on Delivery.");
        return;
      }

      setIsProcessingPayment(true);
      await openRazorpayCheckout({
        key: result.razorpayKeyId,
        amount: result.amount,
        currency: result.currency,
        order_id: result.razorpayOrderId,
        name: school.name,
        description: album.title,
        prefill: { name: customerName, email: customerEmail },
        handler: (response) => {
          verifyPayment.mutate(
            {
              orderId: result.orderId,
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            },
            {
              onSuccess: (order) => {
                setPlacedOrder(order);
                clearCart();
                toast.success("Payment successful! A confirmation has been sent to your email.");
              },
              onError: (err) => toast.error((err as unknown as ApiError).message ?? "Payment verification failed. Please contact support."),
              onSettled: () => setIsProcessingPayment(false),
            },
          );
        },
        modal: { ondismiss: () => setIsProcessingPayment(false) },
      });
    } catch (e) {
      setIsProcessingPayment(false);
      toast.error((e as ApiError).message ?? "Couldn't start the online payment. Please try again or choose Cash on Delivery.");
    }
  }

  if (isSchoolLoading || isAlbumLoading || !school || !album) {
    return (
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 sm:py-12">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-8 w-56" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (placedOrder) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 p-8 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 className="h-7 w-7" />
            </span>
            <h1 className="text-xl font-semibold tracking-tight">Order confirmed</h1>
            <p className="text-sm text-muted-foreground">
              Order <span className="font-medium text-foreground">{placedOrder.orderNumber}</span> has been placed for{" "}
              <span className="font-medium text-foreground">{formatCurrency(placedOrder.totals.total, placedOrder.totals.currencyCode)}</span>.{" "}
              {placedOrder.paymentMethod === "cod"
                ? "Please keep the amount ready — payment is collected on delivery."
                : "Your payment was received."}{" "}
              We've emailed a receipt to {placedOrder.customerEmail}.
            </p>
            <Link href={routes.storefront.school(schoolSlug)} className={cn(buttonVariants({ variant: "default" }), "mt-2")}>
              Back to {school?.name ?? "storefront"}
            </Link>
          </CardContent>
        </Card>
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
        <Link href={routes.storefront.cart(schoolSlug, albumId)} className="transition-colors hover:text-foreground">
          Cart
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Checkout</span>
      </nav>

      <PageHeader title="Checkout" description={`Complete your order from “${album.title}”.`} />

      {!cart || cart.items.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add photos to your cart before checking out."
          action={
            <Link href={routes.storefront.album(schoolSlug, albumId)} className={buttonVariants({ variant: "default" })}>
              Browse photos
            </Link>
          }
        />
      ) : (
        <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Contact details</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="customer-name">Full name</Label>
                  <Input id="customer-name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="customer-email">Email</Label>
                  <Input id="customer-email" type="email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} required />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Delivery method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {SHIPPING_OPTIONS.map((option) => (
                  <label
                    key={option.id}
                    className={cn(
                      "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                      shippingMethodId === option.id ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
                    )}
                  >
                    <input
                      type="radio"
                      name="shipping-method"
                      value={option.id}
                      checked={shippingMethodId === option.id}
                      onChange={() => setShippingMethod(option.id)}
                      className="mt-0.5 h-4 w-4 accent-primary"
                    />
                    <span className="flex-1 space-y-0.5">
                      <span className="block text-sm font-medium">{option.label}</span>
                      <span className="block text-xs text-muted-foreground">{option.description}</span>
                    </span>
                    <span className="text-sm font-medium">{option.price > 0 ? formatCurrency(option.price, currencyCode) : "Free"}</span>
                  </label>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment method</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2.5">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
                  )}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value="cod"
                    checked={paymentMethod === "cod"}
                    onChange={() => setPaymentMethod("cod")}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <Banknote className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 space-y-0.5">
                    <span className="block text-sm font-medium">Cash on delivery</span>
                    <span className="block text-xs text-muted-foreground">Pay in cash when your order is ready.</span>
                  </span>
                </label>
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
                    paymentMethod === "razorpay" ? "border-primary bg-primary/5" : "border-border hover:bg-accent/50",
                  )}
                >
                  <input
                    type="radio"
                    name="payment-method"
                    value="razorpay"
                    checked={paymentMethod === "razorpay"}
                    onChange={() => setPaymentMethod("razorpay")}
                    className="mt-0.5 h-4 w-4 accent-primary"
                  />
                  <CreditCard className="mt-0.5 h-4 w-4 text-muted-foreground" />
                  <span className="flex-1 space-y-0.5">
                    <span className="block text-sm font-medium">Pay online</span>
                    <span className="block text-xs text-muted-foreground">Card, UPI, or netbanking via Razorpay.</span>
                  </span>
                </label>
              </CardContent>
            </Card>

            {needsAddress ? (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Shipping address</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address-name">Recipient name</Label>
                    <Input id="address-name" value={address.fullName} onChange={(e) => setAddress((a) => ({ ...a, fullName: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address-line1">Address line 1</Label>
                    <Input id="address-line1" value={address.line1} onChange={(e) => setAddress((a) => ({ ...a, line1: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label htmlFor="address-line2">Address line 2 (optional)</Label>
                    <Input id="address-line2" value={address.line2} onChange={(e) => setAddress((a) => ({ ...a, line2: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address-city">City</Label>
                    <Input id="address-city" value={address.city} onChange={(e) => setAddress((a) => ({ ...a, city: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address-state">State / Province</Label>
                    <Input id="address-state" value={address.state} onChange={(e) => setAddress((a) => ({ ...a, state: e.target.value }))} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address-postal">Postal code</Label>
                    <Input id="address-postal" value={address.postalCode} onChange={(e) => setAddress((a) => ({ ...a, postalCode: e.target.value }))} required />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="address-phone">Phone (optional)</Label>
                    <Input id="address-phone" type="tel" value={address.phone} onChange={(e) => setAddress((a) => ({ ...a, phone: e.target.value }))} />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 p-5">
                {totals ? <OrderSummary totals={totals} currencyCode={currencyCode} taxLabel={school.settings.tax.label || "Tax"} /> : null}
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting || !shippingMethodId}>
                  {isProcessingPayment
                    ? "Processing payment…"
                    : isSubmitting
                      ? "Placing order…"
                      : paymentMethod === "razorpay"
                        ? "Pay now"
                        : "Place order"}
                </Button>
                {!shippingMethodId ? <p className="text-center text-xs text-muted-foreground">Choose a delivery method to continue.</p> : null}
              </CardContent>
            </Card>
          </div>
        </form>
      )}
    </div>
  );
}
