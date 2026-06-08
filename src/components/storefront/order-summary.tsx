import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/config/currency";
import type { CartTotals } from "@/types";

interface OrderSummaryProps {
  totals: CartTotals;
  currencyCode: string;
  taxLabel?: string;
  className?: string;
}

/** Shared subtotal/discount/shipping/tax/total breakdown — used on both the cart and checkout pages. */
export function OrderSummary({ totals, currencyCode, taxLabel = "Tax", className }: OrderSummaryProps) {
  return (
    <div className={className}>
      <dl className="space-y-2.5 text-sm">
        <Row label={`Subtotal (${totals.itemCount} ${totals.itemCount === 1 ? "item" : "items"})`} value={formatCurrency(totals.subtotal, currencyCode)} />
        {totals.discount > 0 ? <Row label="Discount" value={`− ${formatCurrency(totals.discount, currencyCode)}`} tone="positive" /> : null}
        <Row label="Shipping" value={totals.shipping > 0 ? formatCurrency(totals.shipping, currencyCode) : "Free"} />
        {totals.tax > 0 ? <Row label={taxLabel} value={formatCurrency(totals.tax, currencyCode)} /> : null}
      </dl>
      <Separator className="my-3" />
      <div className="flex items-baseline justify-between text-base font-semibold">
        <span>Total</span>
        <span>{formatCurrency(totals.total, currencyCode)}</span>
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "positive" }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={tone === "positive" ? "text-emerald-600 dark:text-emerald-400" : undefined}>{value}</dd>
    </div>
  );
}
