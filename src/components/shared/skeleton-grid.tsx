import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface SkeletonGridProps {
  count?: number;
  className?: string;
  itemClassName?: string;
}

/** Generic grid of placeholder cards — used while albums, photos, or schools are loading. */
export function SkeletonGrid({ count = 8, className, itemClassName }: SkeletonGridProps) {
  return (
    <div className={cn("grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className={cn("aspect-[4/3] w-full rounded-lg", itemClassName)} />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      ))}
    </div>
  );
}
