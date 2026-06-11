import { ImageIcon } from "lucide-react";
import type { ProductMockupLayout } from "@/config/product-mockups";

interface ProductMockupProps {
  layout: ProductMockupLayout;
  /** The customer's own photo — different per album/kid, composited dynamically onto the mockup. */
  photoUrl?: string;
  className?: string;
}

function Photo({ photoUrl, className = "" }: { photoUrl?: string; className?: string }) {
  if (!photoUrl) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <ImageIcon className="h-1/4 w-1/4 text-muted-foreground/40" />
      </div>
    );
  }
  return (
    <div
      className={`bg-cover bg-center ${className}`}
      style={{ backgroundImage: `url(${photoUrl})` }}
    />
  );
}

/** Renders a CSS-only product mockup with the customer's photo composited on top — same product, different photo per album. */
export function ProductMockup({ layout, photoUrl, className = "" }: ProductMockupProps) {
  switch (layout) {
    case "single":
      return (
        <div className={`aspect-[2/3] w-full overflow-hidden rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 ${className}`}>
          <Photo photoUrl={photoUrl} className="h-full w-full rounded-sm" />
        </div>
      );

    case "grid-2":
      return (
        <div className={`aspect-[2/3] w-full space-y-1 overflow-hidden rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 ${className}`}>
          <Photo photoUrl={photoUrl} className="h-1/2 w-full rounded-sm" />
          <Photo photoUrl={photoUrl} className="h-1/2 w-full rounded-sm" />
        </div>
      );

    case "grid-3":
      return (
        <div className={`aspect-[2/3] w-full space-y-1 overflow-hidden rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 ${className}`}>
          <Photo photoUrl={photoUrl} className="h-1/2 w-full rounded-sm" />
          <div className="flex h-1/2 gap-1">
            <Photo photoUrl={photoUrl} className="h-full w-1/2 rounded-sm" />
            <Photo photoUrl={photoUrl} className="h-full w-1/2 rounded-sm" />
          </div>
        </div>
      );

    case "grid-8":
      return (
        <div className={`grid aspect-[2/3] w-full grid-cols-2 grid-rows-4 gap-1 overflow-hidden rounded-md bg-white p-1.5 shadow-sm ring-1 ring-black/5 ${className}`}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Photo key={i} photoUrl={photoUrl} className="h-full w-full rounded-sm" />
          ))}
        </div>
      );

    case "mug":
      return (
        <div className={`flex aspect-[4/3] w-full items-center justify-center ${className}`}>
          <div className="flex h-3/4 w-[85%] overflow-hidden rounded-l-lg rounded-r-md shadow-sm ring-1 ring-black/5">
            <Photo photoUrl={photoUrl} className="h-full w-[78%]" />
            <div className="h-full w-[22%] bg-white" />
          </div>
          <div className="-ml-1 h-2/5 w-[12%] rounded-r-full border-[5px] border-l-0 border-white shadow-sm ring-1 ring-black/5" />
        </div>
      );

    case "mousepad":
      return (
        <div className={`flex aspect-[4/3] w-full items-center justify-center ${className}`}>
          <Photo photoUrl={photoUrl} className="h-full w-full rounded-xl shadow-sm ring-1 ring-black/5" />
        </div>
      );

    case "keychain":
      return (
        <div className={`flex aspect-[4/3] w-full flex-col items-center justify-center gap-0.5 ${className}`}>
          <div className="h-3 w-5 rounded-full border-[3px] border-muted-foreground/30 bg-transparent" />
          <Photo photoUrl={photoUrl} className="aspect-square h-[68%] rounded-full shadow-sm ring-1 ring-black/5" />
        </div>
      );

    case "card":
      return (
        <div className={`flex aspect-[2/3] w-full flex-col overflow-hidden rounded-md bg-white shadow-sm ring-1 ring-black/5 ${className}`}>
          <Photo photoUrl={photoUrl} className="h-3/5 w-full" />
          <div className="flex flex-1 flex-col items-center justify-center gap-1 border-t border-dashed border-border bg-primary/5 px-2">
            <div className="h-1 w-3/5 rounded-full bg-primary/20" />
            <div className="h-1 w-2/5 rounded-full bg-primary/20" />
          </div>
        </div>
      );

    default:
      return <Photo photoUrl={photoUrl} className={`aspect-[2/3] w-full rounded-md ${className}`} />;
  }
}
