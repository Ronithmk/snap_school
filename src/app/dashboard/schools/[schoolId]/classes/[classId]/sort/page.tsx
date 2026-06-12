"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, ChevronRight, Plus, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useAlbum, useAlbumPhotos, useClass, useSplitAlbum } from "@/hooks/use-albums";
import { useStudents } from "@/hooks/use-students";
import { useSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";
import type { ApiError, Photo, SplitAlbumGroupInput } from "@/types";

interface PendingGroup extends SplitAlbumGroupInput {
  /** Local id for list rendering / removal. */
  key: string;
  photos: Photo[];
}

interface Props {
  params: Promise<{ schoolId: string; classId: string }>;
}

export default function SortPhotosPage({ params }: Props) {
  const { schoolId, classId } = use(params);
  const router = useRouter();

  const { data: school } = useSchool(schoolId);
  const { data: schoolClass, isLoading: isClassLoading } = useClass(classId);
  const { data: stagingAlbum, isLoading: isAlbumLoading } = useAlbum(schoolClass?.stagingAlbumId ?? undefined);
  const { data: students } = useStudents(schoolId, classId);
  const {
    data: photoPages,
    isLoading: isPhotosLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useAlbumPhotos(schoolClass?.stagingAlbumId ?? undefined);
  const splitAlbum = useSplitAlbum(schoolId);

  // Sorting needs the full photo set, so eagerly load every page.
  useEffect(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const allPhotos = useMemo(() => photoPages?.pages.flatMap((page) => page.data) ?? [], [photoPages]);

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [coverId, setCoverId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [groups, setGroups] = useState<PendingGroup[]>([]);

  const assignedIds = useMemo(() => new Set(groups.flatMap((g) => g.photoIds)), [groups]);
  const availablePhotos = allPhotos.filter((p) => !assignedIds.has(p.id));

  const studentNames = useMemo(() => new Map((students ?? []).map((s) => [s.name.toLowerCase(), s.id])), [students]);

  function togglePhoto(photo: Photo) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(photo.id)) {
        next.delete(photo.id);
        if (coverId === photo.id) setCoverId(null);
      } else {
        next.add(photo.id);
      }
      return next;
    });
  }

  function addGroup() {
    const trimmed = title.trim();
    if (!trimmed || selectedIds.size === 0) return;

    const selectedPhotos = allPhotos.filter((p) => selectedIds.has(p.id));
    const cover = coverId ?? selectedPhotos[0]?.id;
    const studentId = studentNames.get(trimmed.toLowerCase()) ?? null;

    setGroups((prev) => [
      ...prev,
      {
        key: `${Date.now()}-${prev.length}`,
        title: trimmed,
        photoIds: selectedPhotos.map((p) => p.id),
        coverPhotoId: cover,
        studentId,
        photos: selectedPhotos,
      },
    ]);

    setSelectedIds(new Set());
    setCoverId(null);
    setTitle("");
  }

  function removeGroup(key: string) {
    setGroups((prev) => prev.filter((g) => g.key !== key));
  }

  async function handleCreateAlbums() {
    if (!stagingAlbum || groups.length === 0) return;
    try {
      const result = await splitAlbum.mutateAsync({
        albumId: stagingAlbum.id,
        groups: groups.map(({ title, photoIds, coverPhotoId, studentId }) => ({ title, photoIds, coverPhotoId, studentId })),
      });
      toast.success(`Created ${result.albums.length} album${result.albums.length === 1 ? "" : "s"}.`);
      router.push(routes.dashboard.class(schoolId, classId));
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't create albums. Please try again.");
    }
  }

  if (isClassLoading || isAlbumLoading || !school || !schoolClass) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-64" />
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-square w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (!stagingAlbum) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-muted-foreground">This class doesn&apos;t have a photo intake album yet.</p>
        <Link href={routes.dashboard.class(schoolId, classId)} className="text-sm font-medium text-primary hover:underline">
          Back to {schoolClass.name}
        </Link>
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
        <Link href={routes.dashboard.class(schoolId, classId)} className="transition-colors hover:text-foreground">
          {schoolClass.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="truncate text-foreground">Sort &amp; create albums</span>
      </nav>

      <div>
        <h1 className="text-xl font-semibold tracking-tight">Sort &amp; create albums</h1>
        <p className="text-sm text-muted-foreground">
          Select the photos that belong to one album, give it a title, and add it to the list below. When you&apos;re
          done, create all the albums at once — the photos move out of the intake album automatically.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-3">
          <p className="text-sm font-medium">
            {availablePhotos.length} unsorted photo{availablePhotos.length === 1 ? "" : "s"}
            {selectedIds.size > 0 ? ` — ${selectedIds.size} selected` : ""}
          </p>
          {isPhotosLoading || hasNextPage ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <Skeleton key={i} className="aspect-square w-full rounded-lg" />
              ))}
            </div>
          ) : availablePhotos.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
              No unsorted photos left. Upload more to the intake album, or create the albums for the groups you&apos;ve
              already built.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {availablePhotos.map((photo) => {
                const selected = selectedIds.has(photo.id);
                const isCover = coverId === photo.id;
                return (
                  <figure
                    key={photo.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => togglePhoto(photo)}
                    className={cn(
                      "group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-muted ring-2 ring-transparent transition-all",
                      selected && "ring-primary",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo.thumbnailUrl} alt={photo.fileName} loading="lazy" className="h-full w-full object-cover" />
                    <div
                      className={cn(
                        "absolute left-1.5 top-1.5 flex h-5 w-5 items-center justify-center rounded border bg-background/80 text-transparent backdrop-blur-sm",
                        selected && "border-primary bg-primary text-primary-foreground",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </div>
                    {selected ? (
                      <button
                        type="button"
                        title="Set as cover photo"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCoverId(photo.id);
                        }}
                        className={cn(
                          "absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-muted-foreground backdrop-blur-sm transition-colors hover:text-amber-500",
                          isCover && "text-amber-500",
                        )}
                      >
                        <Star className={cn("h-3.5 w-3.5", isCover && "fill-current")} />
                      </button>
                    ) : null}
                  </figure>
                );
              })}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-sm font-semibold">New album</p>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Album title, e.g. student name"
                list="sort-student-names"
              />
              <datalist id="sort-student-names">
                {(students ?? []).map((s) => (
                  <option key={s.id} value={s.name} />
                ))}
              </datalist>
              <p className="text-xs text-muted-foreground">
                {selectedIds.size} photo{selectedIds.size === 1 ? "" : "s"} selected
                {coverId ? " — cover set" : selectedIds.size > 0 ? " — first selected will be the cover" : ""}
              </p>
              <Button className="w-full" onClick={addGroup} disabled={!title.trim() || selectedIds.size === 0}>
                <Plus className="h-4 w-4" />
                Add to list
              </Button>
            </CardContent>
          </Card>

          {groups.length > 0 ? (
            <div className="space-y-2">
              <p className="text-sm font-semibold">Albums to create ({groups.length})</p>
              {groups.map((group) => (
                <Card key={group.key}>
                  <CardContent className="space-y-2 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium">{group.title}</p>
                      <button
                        type="button"
                        onClick={() => removeGroup(group.key)}
                        className="shrink-0 text-muted-foreground transition-colors hover:text-destructive"
                        aria-label={`Remove ${group.title}`}
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {group.photos.map((photo) => (
                        <div key={photo.id} className="relative h-10 w-10 overflow-hidden rounded-md bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={photo.thumbnailUrl} alt={photo.fileName} className="h-full w-full object-cover" />
                          {photo.id === group.coverPhotoId ? (
                            <Star className="absolute right-0.5 top-0.5 h-3 w-3 fill-amber-500 text-amber-500" />
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {group.studentId ? <p className="text-xs text-positive">Matched to student</p> : null}
                  </CardContent>
                </Card>
              ))}
              <Button className="w-full" onClick={handleCreateAlbums} disabled={splitAlbum.isPending}>
                <Trash2 className="hidden" />
                Create {groups.length} album{groups.length === 1 ? "" : "s"}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
