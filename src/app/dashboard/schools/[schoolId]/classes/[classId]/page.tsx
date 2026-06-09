"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Check, ChevronRight, Copy, ExternalLink, ImageIcon, Pencil, Plus, ShoppingCart } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumFormSheet, ClassFormSheet } from "@/components/dashboard";
import { useSchool } from "@/hooks/use-tenant";
import { useClass, useSchoolAlbums, useSchoolClasses } from "@/hooks/use-albums";
import { ALBUM_VISIBILITY_LABELS, ALBUM_VISIBILITY_TONE } from "@/config/constants";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

interface ClassDetailPageProps {
  params: Promise<{ schoolId: string; classId: string }>;
}

export default function ClassDetailPage({ params }: ClassDetailPageProps) {
  const { schoolId, classId } = use(params);
  const { data: school, isLoading: isSchoolLoading } = useSchool(schoolId);
  const { data: schoolClass, isLoading: isClassLoading } = useClass(classId);
  const { data: classes } = useSchoolClasses(schoolId);
  const { data: albums, isLoading: isAlbumsLoading } = useSchoolAlbums(schoolId, { classId });

  const [editOpen, setEditOpen] = useState(false);
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);

  if (isSchoolLoading || isClassLoading || !school || !schoolClass) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
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
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">{schoolClass.name}</span>
      </nav>

      <PageHeader
        title={schoolClass.name}
        description={schoolClass.grouping ? `${schoolClass.grouping} · ${schoolClass.albumCount} albums` : `${schoolClass.albumCount} albums`}
        actions={
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4" />
            Edit class
          </Button>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Slug</p>
            <p className="text-sm font-medium">{schoolClass.slug}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Grouping</p>
            <p className="text-sm font-medium">{schoolClass.grouping ?? "—"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Students</p>
            <p className="text-sm font-medium">{schoolClass.studentCount ?? "—"}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Albums</p>
            <p className="text-sm font-medium">{schoolClass.albumCount}</p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Albums</h2>
        <Button size="sm" onClick={() => setCreateAlbumOpen(true)}>
          <Plus className="h-4 w-4" />
          Add album
        </Button>
      </div>

      {isAlbumsLoading || !albums ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/3] w-full rounded-xl" />
          ))}
        </div>
      ) : albums.data.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No albums yet"
          description="Create an album for this class, then upload photos for families to browse and order."
          action={
            <Button onClick={() => setCreateAlbumOpen(true)}>
              <Plus className="h-4 w-4" />
              Add album
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albums.data.map((album) => (
            <Link
              key={album.id}
              href={routes.dashboard.album(schoolId, album.id)}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-primary/40"
            >
              <div className="aspect-[4/3] w-full overflow-hidden bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={album.coverImageUrl} alt={album.title} className="h-full w-full object-cover transition-transform group-hover:scale-[1.03]" />
              </div>
              <div className="space-y-1.5 p-3">
                <p className="truncate text-sm font-medium">{album.title}</p>
                <div className="flex items-center gap-1.5">
                  <Badge variant={ALBUM_VISIBILITY_TONE[album.visibility]} className={cn("text-[10px]")}>
                    {ALBUM_VISIBILITY_LABELS[album.visibility]}
                  </Badge>
                  <span className="text-xs text-muted-foreground">{album.photoCount} photos</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Access links table — like the "Access the maps" view */}
      {albums && albums.data.length > 0 ? (
        <AccessLinksTable albums={albums.data} school={school} schoolId={schoolId} />
      ) : null}

      <ClassFormSheet open={editOpen} onOpenChange={setEditOpen} schoolId={schoolId} schoolClass={schoolClass} />
      <AlbumFormSheet
        open={createAlbumOpen}
        onOpenChange={setCreateAlbumOpen}
        schoolId={schoolId}
        classes={classes ?? []}
        defaultClassId={classId}
      />
    </div>
  );
}

function AccessLinksTable({
  albums,
  school,
  schoolId,
}: {
  albums: import("@/types").Album[];
  school: import("@/types").School;
  schoolId: string;
}) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function copy(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedKey(key);
      setTimeout(() => setCopiedKey(null), 2000);
    });
  }

  return (
    <div className="space-y-3">
      <h2 className="text-base font-semibold tracking-tight">Access links</h2>
      <p className="text-sm text-muted-foreground">
        Each album has its own unique gallery and cart link — copy and share them directly with students or families.
      </p>
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40">
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Album</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Gallery link</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Cart / Order link</th>
              <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">Open</th>
            </tr>
          </thead>
          <tbody>
            {albums.map((album) => {
              const galleryUrl = `${origin}${album.shareUrl}`;
              const cartUrl = `${origin}${album.shareUrl}/cart`;
              return (
                <tr key={album.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <Link href={routes.dashboard.album(schoolId, album.id)} className="font-medium text-sm hover:underline">
                      {album.title}
                    </Link>
                    <p className="text-xs text-muted-foreground">{album.photoCount} photos</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[180px] truncate text-xs text-muted-foreground">{galleryUrl}</span>
                      <button
                        type="button"
                        onClick={() => copy(`gallery-${album.id}`, galleryUrl)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Copy gallery link"
                      >
                        {copiedKey === `gallery-${album.id}` ? (
                          <Check className="h-3.5 w-3.5 text-positive" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="max-w-[180px] truncate text-xs text-muted-foreground">{cartUrl}</span>
                      <button
                        type="button"
                        onClick={() => copy(`cart-${album.id}`, cartUrl)}
                        className="shrink-0 rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
                        title="Copy cart link"
                      >
                        {copiedKey === `cart-${album.id}` ? (
                          <Check className="h-3.5 w-3.5 text-positive" />
                        ) : (
                          <Copy className="h-3.5 w-3.5" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link href={galleryUrl} target="_blank" rel="noreferrer" title="Open gallery" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      <Link href={cartUrl} target="_blank" rel="noreferrer" title="Open cart" className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-foreground">
                        <ShoppingCart className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
