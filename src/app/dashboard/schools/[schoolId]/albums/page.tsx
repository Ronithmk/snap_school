"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronRight, Images, Layers, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumFormSheet, BulkAlbumSheet } from "@/components/dashboard";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolAlbums, useSchoolClasses } from "@/hooks/use-albums";
import { ALBUM_VISIBILITY_LABELS, ALBUM_VISIBILITY_TONE } from "@/config/constants";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolAlbumsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: albums, isLoading } = useSchoolAlbums(schoolId);
  const { data: classes } = useSchoolClasses(schoolId);
  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="transition-colors hover:text-foreground">Schools</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={routes.dashboard.school(schoolId)} className="transition-colors hover:text-foreground truncate">
          {school?.name ?? schoolId}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Albums</span>
      </nav>

      <PageHeader
        title="Albums"
        description="Photo albums and galleries for this school."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <Layers className="h-4 w-4" />
              Bulk add
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              New album
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      ) : !albums || albums.data.length === 0 ? (
        <EmptyState
          icon={Images}
          title="No albums yet"
          description="Create the first album for this school."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />New album</Button>}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {albums.data.map((album) => (
            <Link key={album.id} href={routes.dashboard.album(schoolId, album.id)}>
              <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
                {album.coverImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={album.coverImageUrl} alt={album.title} className="h-28 w-full object-cover" />
                ) : (
                  <div className="flex h-28 items-center justify-center bg-muted">
                    <Images className="h-8 w-8 text-muted-foreground/30" />
                  </div>
                )}
                <CardContent className="p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-medium text-sm">{album.title}</p>
                    <Badge
                      variant={ALBUM_VISIBILITY_TONE[album.visibility] as "default"}
                      className="shrink-0 text-xs"
                    >
                      {ALBUM_VISIBILITY_LABELS[album.visibility]}
                    </Badge>
                  </div>
                  {album.photoCount != null && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{album.photoCount} photos</p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <AlbumFormSheet open={createOpen} onOpenChange={setCreateOpen} schoolId={schoolId} classes={classes ?? []} />
      <BulkAlbumSheet open={bulkOpen} onOpenChange={setBulkOpen} schoolId={schoolId} classes={classes ?? []} existingAlbums={albums?.data ?? []} />
    </div>
  );
}
