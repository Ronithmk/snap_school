"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  src?: string;
  alt?: string;
  fallback?: string;
}

export function Avatar({ src, alt = "", fallback, className, ...props }: AvatarProps) {
  const [errored, setErrored] = React.useState(false);
  const showImage = src && !errored;

  return (
    <span
      className={cn(
        "relative flex h-9 w-9 shrink-0 overflow-hidden rounded-full",
        "border border-border bg-muted text-muted-foreground",
        "select-none",
        className,
      )}
      {...props}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt={alt} className="h-full w-full object-cover" onError={() => setErrored(true)} />
      ) : (
        <span className="flex h-full w-full items-center justify-center text-xs font-semibold uppercase">
          {fallback ?? alt.slice(0, 2).toUpperCase()}
        </span>
      )}
    </span>
  );
}
