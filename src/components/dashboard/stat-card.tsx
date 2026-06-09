import type { LucideIcon } from "lucide-react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  changePercent?: number;
}

export function StatCard({ label, value, icon: Icon, changePercent }: StatCardProps) {
  const isPositive = (changePercent ?? 0) >= 0;
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-2xl font-semibold tracking-tight">{value}</p>
          {changePercent !== undefined && (
            <p className={cn("inline-flex items-center gap-0.5 text-xs font-medium", isPositive ? "text-foreground" : "text-destructive")}>
              <TrendIcon className="h-3.5 w-3.5" />
              {Math.abs(changePercent).toFixed(1)}% vs last period
            </p>
          )}
        </div>
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-foreground/5 text-muted-foreground">
          <Icon className="h-4.5 w-4.5" />
        </span>
      </CardContent>
    </Card>
  );
}
