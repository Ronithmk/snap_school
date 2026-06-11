"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, ImagePlus, Loader2, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useUploadPhotos } from "@/hooks/use-albums";
import { cn } from "@/lib/utils";
import type { ApiError, Photo } from "@/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];

/** Files are uploaded in chunks of this size to avoid request size/timeout limits on large bulk uploads. */
const BATCH_SIZE = 6;

interface UploadResult {
  photos: Photo[];
  flaggedCount: number;
}

interface PhotoUploadDropzoneProps {
  albumId: string;
}

export function PhotoUploadDropzone({ albumId }: PhotoUploadDropzoneProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [lastResult, setLastResult] = useState<UploadResult | null>(null);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadPhotos(albumId);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const incoming = Array.from(list).filter((file) => ACCEPTED_TYPES.includes(file.type));
    if (incoming.length < list.length) toast.error("Only JPG, PNG, and WEBP images are supported.");
    setFiles((prev) => [...prev, ...incoming]);
    setLastResult(null);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleUpload() {
    if (files.length === 0) return;
    const batches: File[][] = [];
    for (let i = 0; i < files.length; i += BATCH_SIZE) batches.push(files.slice(i, i + BATCH_SIZE));

    const combined: UploadResult = { photos: [], flaggedCount: 0 };
    setProgress({ done: 0, total: files.length });

    try {
      for (const batch of batches) {
        const result = await upload.mutateAsync({ albumId, files: batch });
        combined.photos.push(...result.photos);
        combined.flaggedCount += result.flaggedCount;
        setProgress((prev) => (prev ? { done: prev.done + batch.length, total: prev.total } : null));
      }
      setLastResult(combined);
      setFiles([]);
      if (inputRef.current) inputRef.current.value = "";
      if (combined.flaggedCount > 0) {
        toast.warning(
          `${combined.photos.length} photo${combined.photos.length === 1 ? "" : "s"} uploaded — ${combined.flaggedCount} flagged for review.`,
        );
      } else {
        toast.success(`Uploaded ${combined.photos.length} photo${combined.photos.length === 1 ? "" : "s"}.`);
      }
    } catch (err) {
      if (combined.photos.length > 0) setLastResult(combined);
      toast.error((err as ApiError).message ?? "Upload failed. Please try again.");
    } finally {
      setProgress(null);
    }
  }

  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-border hover:bg-accent/40",
        )}
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <UploadCloud className="h-5 w-5" />
        </span>
        <p className="text-sm font-medium">Drag and drop photos here, or click to browse</p>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WEBP — select hundreds at once for bulk upload</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={ACCEPTED_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => addFiles(e.target.files)}
        />
      </div>

      {files.length > 0 ? (
        <div className="space-y-3 rounded-xl border border-border p-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {files.length} photo{files.length === 1 ? "" : "s"} ready to upload
            </p>
            <Button size="sm" onClick={handleUpload} disabled={!!progress}>
              {progress ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Upload {files.length} photo{files.length === 1 ? "" : "s"}
            </Button>
          </div>
          {progress ? (
            <div className="space-y-1.5">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.round((progress.done / progress.total) * 100)}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">Uploading {progress.done} of {progress.total}…</p>
            </div>
          ) : null}
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {files.map((file, index) => (
              <li key={`${file.name}-${index}`} className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-2.5 py-1.5 text-xs">
                <span className="min-w-0 flex-1 truncate" title={file.name}>
                  {file.name}
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                  aria-label={`Remove ${file.name}`}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {lastResult ? (
        <div className={cn(
          "rounded-xl border p-4 space-y-3",
          lastResult.flaggedCount > 0 ? "border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30" : "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30",
        )}>
          <div className="flex items-center gap-2">
            {lastResult.flaggedCount > 0 ? (
              <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            )}
            <p className="text-sm font-medium">
              {lastResult.flaggedCount > 0
                ? `${lastResult.photos.length} uploaded — ${lastResult.flaggedCount} need review`
                : `${lastResult.photos.length} photo${lastResult.photos.length === 1 ? "" : "s"} uploaded successfully`}
            </p>
          </div>

          {lastResult.photos.length > 0 ? (
            <ul className="space-y-1">
              {lastResult.photos.map((photo) => (
                <li key={photo.id} className="flex items-center justify-between gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate text-muted-foreground">{photo.fileName}</span>
                  {photo.faceValidationStatus === "flagged" ? (
                    <Badge variant="warning" className="shrink-0 text-[10px]">Face mismatch</Badge>
                  ) : photo.faceValidationStatus === "matched" ? (
                    <Badge variant="positive" className="shrink-0 text-[10px]">Matched</Badge>
                  ) : photo.faceValidationStatus === "skipped" ? (
                    <Badge variant="neutral" className="shrink-0 text-[10px]">No check</Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-[10px]">Pending</Badge>
                  )}
                </li>
              ))}
            </ul>
          ) : null}

          {lastResult.flaggedCount > 0 ? (
            <p className="text-xs text-amber-700 dark:text-amber-300">
              Flagged photos are hidden from the storefront until reviewed in the Approvals page.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
