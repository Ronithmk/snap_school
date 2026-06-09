"use client";

import { use, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Check, ChevronRight, Copy, ExternalLink, ImageIcon, Link2, Pencil, ShoppingCart, Trash2 } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumFormSheet, PhotoUploadDropzone } from "@/components/dashboard";
import { useSchool } from "@/hooks/use-tenant";
import { useAlbum, useAlbumPhotos, useDeleteAlbum, useSchoolClasses } from "@/hooks/use-albums";
import { ALBUM_VISIBILITY_LABELS, ALBUM_VISIBILITY_TONE } from "@/config/constants";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import type { ApiError } from "@/types";

interface AlbumDetailPageProps {
  params: Promise<{ schoolId: string; albumId: string }>;
}

export default function AlbumDetailPage({ params }: AlbumDetailPageProps) {
  const { schoolId, albumId } = use(params);
  const router = useRouter();

  const { data: school, isLoading: isSchoolLoading } = useSchool(schoolId);
  const { data: album, isLoading: isAlbumLoading } = useAlbum(albumId);
  const { data: classes } = useSchoolClasses(schoolId);
  const { data: photoPages, isLoading: isPhotosLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useAlbumPhotos(albumId);
  const deleteAlbum = useDeleteAlbum(schoolId);

  const [editOpen, setEditOpen] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const photos = photoPages?.pages.flatMap((page) => page.data) ?? [];
  const schoolClass = classes?.find((c) => c.id === album?.classId);

  if (isSchoolLoading || isAlbumLoading || !school || !album) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-72" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-40 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  async function handleDelete() {
    try {
      await deleteAlbum.mutateAsync(album!.id);
      toast.success("Album deleted.");
      router.push(routes.dashboard.school(schoolId));
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't delete the album. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="transition-colors hover:text-foreground">
          Schools
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={routes.dashboard.school(schoolId)} className="transition-colors hover:text-foreground">
          {school.name}
        </Link>
        {schoolClass ? (
          <>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link href={routes.dashboard.class(schoolId, schoolClass.id)} className="transition-colors hover:text-foreground">
              {schoolClass.name}
            </Link>
          </>
        ) : null}
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{album.title}</span>
      </nav>

      <PageHeader
        title={album.title}
        description={album.description ?? `${album.photoCount} photos`}
        actions={
          <>
            <Link href={album.shareUrl} target="_blank" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink className="h-4 w-4" />
              View in storefront
            </Link>
            <Button variant="outline" onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit album
            </Button>
            {confirmingDelete ? (
              <div className="flex items-center gap-2">
                <Button variant="destructive" onClick={handleDelete} disabled={deleteAlbum.isPending}>
                  <Trash2 className="h-4 w-4" />
                  Confirm delete
                </Button>
                <Button variant="ghost" onClick={() => setConfirmingDelete(false)} disabled={deleteAlbum.isPending}>
                  Cancel
                </Button>
              </div>
            ) : (
              <Button variant="outline" className="text-destructive hover:text-destructive" onClick={() => setConfirmingDelete(true)}>
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            )}
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Visibility</p>
            <Badge variant={ALBUM_VISIBILITY_TONE[album.visibility]}>{ALBUM_VISIBILITY_LABELS[album.visibility]}</Badge>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Class</p>
            <p className="text-sm font-medium">{schoolClass?.name ?? "School-wide"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Event date</p>
            <p className="text-sm font-medium">
              {album.eventDate ? new Date(album.eventDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" }) : "—"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Pricing</p>
            <p className="text-sm font-medium">{album.pricing.priceListId ? "Custom price list" : "School default"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Password</p>
            <p className="text-sm font-medium">{album.passwordProtected ? "Protected" : "Open access"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Photos</p>
            <p className="text-sm font-medium">{album.photoCount}</p>
          </div>
        </CardContent>
      </Card>

      {/* Share & Access Links */}
      <AlbumAccessLinksCard album={album} school={school} />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Upload photos</h2>
        <PhotoUploadDropzone albumId={album.id} />
      </div>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Photos ({album.photoCount})</h2>
        {isPhotosLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-lg" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <EmptyState
            icon={ImageIcon}
            title="No photos yet"
            description="Upload photos above to start building this gallery for families to browse and order."
          />
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {photos.map((photo) => (
                <figure key={photo.id} className={cn("group relative aspect-square overflow-hidden rounded-lg bg-muted")}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.fileName}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <figcaption className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/60 to-transparent px-2 py-1.5 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {photo.fileName}
                  </figcaption>
                </figure>
              ))}
            </div>
            {hasNextPage ? (
              <div className="flex justify-center">
                <Button variant="outline" onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
                  {isFetchingNextPage ? "Loading…" : "Load more photos"}
                </Button>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <AlbumFormSheet open={editOpen} onOpenChange={setEditOpen} schoolId={schoolId} classes={classes ?? []} album={album} />
    </div>
  );
}

function AlbumAccessLinksCard({ album, school }: { album: import("@/types").Album; school: import("@/types").School }) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const galleryUrl = `${origin}${album.shareUrl}`;
  const cartUrl = `${origin}${album.shareUrl}/cart`;

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  return (
    <Card>
      <CardContent className="space-y-4 p-5">
        <div className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold">Share &amp; access links</h2>
        </div>

        <p className="text-xs text-muted-foreground">
          Share these links with students and families. Each album has its own unique gallery and cart URL — copy and distribute them directly.
        </p>

        <div className="space-y-3">
          <LinkRow
            icon={ExternalLink}
            label="Gallery link"
            url={galleryUrl}
            copied={copiedKey === "gallery"}
            onCopy={() => copy("gallery", galleryUrl)}
          />
          <LinkRow
            icon={ShoppingCart}
            label="Cart / order link"
            url={cartUrl}
            copied={copiedKey === "cart"}
            onCopy={() => copy("cart", cartUrl)}
          />
          {album.passwordProtected ? (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              This album is password-protected — share the password separately.
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2 border-t border-border pt-3">
          <Link href={galleryUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ExternalLink className="h-3.5 w-3.5" />
            Open gallery
          </Link>
          <Link href={cartUrl} target="_blank" rel="noreferrer" className={buttonVariants({ variant: "outline", size: "sm" })}>
            <ShoppingCart className="h-3.5 w-3.5" />
            Open cart
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function LinkRow({
  icon: Icon,
  label,
  url,
  copied,
  onCopy,
}: {
  icon: React.ElementType;
  label: string;
  url: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <div className="flex items-center gap-3 rounded-md border border-border bg-muted/30 px-3 py-2">
      <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
      <div className="min-w-0 flex-1">
        <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="truncate text-xs font-medium">{url}</p>
      </div>
      <button
        type="button"
        onClick={onCopy}
        title="Copy link"
        className="shrink-0 rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
      >
        {copied ? <Check className="h-3.5 w-3.5 text-positive" /> : <Copy className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
}
