"use client";

import { useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { FileImage, FileText, Loader2, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AssetType = "image" | "pdf" | "any";

const ACCEPT: Record<AssetType, string> = {
  image: "image/png,image/jpeg,image/webp,image/svg+xml,image/gif",
  pdf:   "application/pdf",
  any:   "image/png,image/jpeg,image/webp,image/svg+xml,image/gif,application/pdf",
};

const MAX_SIZE_MB = 10;

interface ImageUploadProps {
  /** Current value — a URL string (blob, object URL, or remote URL). */
  value?: string;
  onChange: (url: string | undefined) => void;
  /** Label shown on the drop zone when empty. */
  label?: string;
  hint?: string;
  accept?: AssetType;
  /** Visual aspect ratio of the preview area, e.g. "16/5" for banners, "3/1" for logos. */
  aspectRatio?: string;
  className?: string;
  disabled?: boolean;
}

function isPdf(url: string) {
  return url.includes("application/pdf") || url.endsWith(".pdf");
}

export function ImageUpload({
  value,
  onChange,
  label = "Upload image",
  hint,
  accept = "image",
  aspectRatio = "16/5",
  className,
  disabled = false,
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const processFile = (file: File) => {
    setError(null);
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`File must be under ${MAX_SIZE_MB} MB`);
      return;
    }
    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      onChange(e.target?.result as string);
      setIsProcessing(false);
    };
    reader.onerror = () => {
      setError("Could not read file");
      setIsProcessing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const hasValue = !!value;

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          "relative overflow-hidden rounded-xl border-2 border-dashed transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border",
          hasValue ? "border-solid border-border" : "",
          disabled && "pointer-events-none opacity-50",
        )}
        style={{ aspectRatio }}
      >
        {isProcessing ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : hasValue ? (
          /* ── Preview ── */
          <>
            {isPdf(value!) ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-muted/40">
                <FileText className="h-12 w-12 text-muted-foreground/60" />
                <p className="text-xs font-medium text-muted-foreground">PDF uploaded</p>
              </div>
            ) : (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={value} alt="Preview" className="absolute inset-0 h-full w-full object-cover" />
            )}
            {/* Action overlay */}
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/0 opacity-0 transition-all hover:bg-black/30 hover:opacity-100">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => inputRef.current?.click()}
                className="shadow"
              >
                <Upload className="h-3.5 w-3.5" />
                Replace
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => onChange(undefined)}
                className="shadow text-destructive hover:text-destructive"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Remove
              </Button>
            </div>
          </>
        ) : (
          /* ── Empty drop zone ── */
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center focus:outline-none"
          >
            <div className="rounded-full bg-muted p-3">
              <FileImage className="h-6 w-6 text-muted-foreground/60" />
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">{label}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {isDragging ? "Drop it here" : "Drag & drop, or click to browse"}
              </p>
              {hint && <p className="mt-0.5 text-xs text-muted-foreground/70">{hint}</p>}
            </div>
          </button>
        )}
      </div>

      {error && <p className="text-xs text-destructive">{error}</p>}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT[accept]}
        className="sr-only"
        onChange={handleFileChange}
        disabled={disabled}
      />
    </div>
  );
}
