"use client";

import { use, useState } from "react";
import Link from "next/link";
import { CheckCircle, Eye, Globe, Images, Loader2, Lock, MessageSquare, X } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchoolAlbums, useUpdateAlbum } from "@/hooks/use-albums";
import { useSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";
import type { Album } from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

function AlbumApprovalCard({
  album,
  schoolId,
  onApprove,
  onPublicApprove,
  isPending,
}: {
  album: Album;
  schoolId: string;
  onApprove: (id: string, unlisted: boolean) => void;
  onPublicApprove: (id: string) => void;
  isPending: boolean;
}) {
  const [showNote, setShowNote] = useState(false);
  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <Card>
      <CardContent className="p-0">
        <div className="flex gap-0">
          {/* Cover thumbnail */}
          <div className="w-28 shrink-0">
            {album.coverImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={album.coverImageUrl} alt={album.title} className="h-full w-full rounded-l-xl object-cover" />
            ) : (
              <div className="flex h-full min-h-[96px] items-center justify-center rounded-l-xl bg-muted">
                <Images className="h-8 w-8 text-muted-foreground/30" />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col gap-2 p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <Link href={routes.dashboard.album(schoolId, album.id)} className="font-medium hover:underline">{album.title}</Link>
                <p className="text-xs text-muted-foreground mt-0.5">{album.photoCount} photos · Created {new Date(album.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p>
              </div>
              <Badge variant="secondary" className="shrink-0 flex items-center gap-1 text-xs">
                <Lock className="h-3 w-3" /> Private
              </Badge>
            </div>

            <p className="text-xs text-muted-foreground truncate">{origin}{album.shareUrl}</p>

            <div className="flex flex-wrap gap-2 pt-1">
              <Button size="sm" onClick={() => onPublicApprove(album.id)} disabled={isPending}>
                {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Globe className="h-3.5 w-3.5" />}
                Approve — make public
              </Button>
              <Button size="sm" variant="outline" onClick={() => onApprove(album.id, true)} disabled={isPending}>
                <Eye className="h-3.5 w-3.5" />
                Approve — unlisted
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowNote((v) => !v)}>
                <MessageSquare className="h-3.5 w-3.5" />
                Add note
              </Button>
            </div>

            {showNote && (
              <div className="flex items-start gap-2 rounded-lg border bg-muted/40 p-2">
                <textarea
                  className="min-h-[56px] w-full resize-none rounded bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                  placeholder="Reason for holding or instructions for photographer…"
                />
                <button type="button" onClick={() => setShowNote(false)} className="mt-0.5 text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function SchoolApprovalsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: albumsPage, isLoading } = useSchoolAlbums(schoolId);
  const updateAlbum = useUpdateAlbum(schoolId);

  const privateAlbums = albumsPage?.data.filter((a) => a.visibility === "private") ?? [];
  const publishedAlbums = albumsPage?.data.filter((a) => a.visibility !== "private") ?? [];

  const approve = (id: string, unlisted: boolean) => {
    updateAlbum.mutate({ id, input: { visibility: unlisted ? "unlisted" : "public" } });
  };

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Approvals</span>
      </nav>

      <PageHeader
        title="Teacher Approvals"
        description="Review private albums before they go live to students and parents."
      />

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}</div>
      ) : privateAlbums.length === 0 ? (
        <EmptyState
          icon={CheckCircle}
          title="All caught up"
          description="No albums are waiting for approval. All private albums will appear here for review."
        />
      ) : (
        <div className="space-y-3">
          <p className="text-sm font-medium text-muted-foreground">{privateAlbums.length} album{privateAlbums.length !== 1 ? "s" : ""} awaiting review</p>
          {privateAlbums.map((album) => (
            <AlbumApprovalCard
              key={album.id}
              album={album}
              schoolId={schoolId}
              onApprove={approve}
              onPublicApprove={(id) => approve(id, false)}
              isPending={updateAlbum.isPending && updateAlbum.variables?.id === album.id}
            />
          ))}
        </div>
      )}

      {publishedAlbums.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="h-px flex-1 bg-border" />
            <p className="text-xs text-muted-foreground">Already published ({publishedAlbums.length})</p>
            <div className="h-px flex-1 bg-border" />
          </div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {publishedAlbums.map((album) => (
              <Link key={album.id} href={routes.dashboard.album(schoolId, album.id)} className="flex items-center gap-3 rounded-xl border px-3 py-2.5 text-sm hover:bg-muted/40 transition-colors">
                <Globe className="h-4 w-4 shrink-0 text-green-500" />
                <div className="min-w-0">
                  <p className="truncate font-medium">{album.title}</p>
                  <p className="text-xs text-muted-foreground">{album.photoCount} photos</p>
                </div>
                <Badge variant="secondary" className="ml-auto shrink-0 text-xs capitalize">{album.visibility}</Badge>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
