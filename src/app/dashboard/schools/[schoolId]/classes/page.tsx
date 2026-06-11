"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BrainCircuit, ChevronRight, FolderOpen, GraduationCap, ImageIcon, Layers, Plus, Tag, Trash2, Upload, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassFormSheet, BulkClassSheet } from "@/components/dashboard";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolClasses } from "@/hooks/use-albums";
import { useSchoolAlbums } from "@/hooks/use-albums";
import { usePriceLists } from "@/hooks/use-pricing";
import { useUpdateClass, useDeleteClass } from "@/hooks/use-albums";
import { CURRENCIES } from "@/config/currency";
import { routes } from "@/config/routes";
import type { ApiError, PriceList, SchoolClass } from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

function currencySymbol(code: string) {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? code;
}

function PriceListBadge({
  cls,
  priceLists,
  onAssign,
}: {
  cls: SchoolClass;
  priceLists: PriceList[];
  onAssign: (cls: SchoolClass) => void;
}) {
  const assigned = priceLists.find((p) => p.id === cls.priceListId);
  if (!assigned) {
    return (
      <button
        type="button"
        onClick={() => onAssign(cls)}
        className="text-xs text-muted-foreground underline-offset-2 hover:underline"
      >
        Assign price list
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={() => onAssign(cls)}
      className="inline-flex items-center gap-1 rounded px-2 py-0.5 text-xs font-medium text-green-700 ring-1 ring-green-300 hover:ring-green-500 dark:text-green-400 dark:ring-green-700 dark:hover:ring-green-500 transition-colors"
      title="Click to change price list"
    >
      {currencySymbol(assigned.currencyCode)} {assigned.name} ({assigned.items.length})
    </button>
  );
}

export default function SchoolClassesPage({ params }: Props) {
  const { schoolId } = use(params);
  const router = useRouter();
  const { data: school } = useSchool(schoolId);
  const { data: classes, isLoading } = useSchoolClasses(schoolId);
  const { data: albumsPage } = useSchoolAlbums(schoolId, {});
  const { data: priceLists } = usePriceLists(schoolId);
  const updateClass = useUpdateClass(schoolId);
  const deleteClass = useDeleteClass(schoolId);

  const [createOpen, setCreateOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<SchoolClass | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteClass.mutateAsync(id);
      toast.success("Class deleted.");
      setConfirmingId(null);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't delete the class. Please try again.");
    }
  }

  // Compute total photo count per class from albums
  const classPhotoMap = useMemo(() => {
    const map = new Map<string, number>();
    for (const album of albumsPage?.data ?? []) {
      if (album.classId) {
        map.set(album.classId, (map.get(album.classId) ?? 0) + album.photoCount);
      }
    }
    return map;
  }, [albumsPage]);

  const [selected, setSelected] = useState<Set<string>>(new Set());

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    if (!classes) return;
    setSelected(selected.size === classes.length ? new Set() : new Set(classes.map((c) => c.id)));
  }

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="transition-colors hover:text-foreground">Schools</Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href={routes.dashboard.school(schoolId)} className="transition-colors hover:text-foreground truncate">
          {school?.name ?? schoolId}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">Classes</span>
      </nav>

      <PageHeader
        title="Classes"
        description="Assign a price list to each class and upload student photos."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => setBulkOpen(true)}>
              <Layers className="h-4 w-4" />
              Bulk add
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add class
            </Button>
          </div>
        }
      />

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}</div>
      ) : !classes || classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No classes yet"
          description="Add the first class to this school."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Add class</Button>}
        />
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-10 px-3 py-2.5">
                  <input
                    type="checkbox"
                    checked={selected.size === classes.length && classes.length > 0}
                    onChange={toggleAll}
                    className="rounded border-border"
                  />
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Name
                </th>
                <th className="px-4 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Products &amp; prices
                </th>
                <th className="px-4 py-2.5 text-center" title="Photos">
                  <ImageIcon className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                </th>
                <th className="px-4 py-2.5 text-center" title="Albums">
                  <FolderOpen className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                </th>
                <th className="px-4 py-2.5 text-center" title="Students">
                  <Users className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                </th>
                <th className="px-4 py-2.5 text-center" title="AI face matching">
                  <BrainCircuit className="mx-auto h-3.5 w-3.5 text-muted-foreground" />
                </th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {classes.map((cls) => {
                const photos = classPhotoMap.get(cls.id) ?? 0;
                return (
                  <tr key={cls.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={selected.has(cls.id)}
                        onChange={() => toggleSelect(cls.id)}
                        className="rounded border-border"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={routes.dashboard.class(schoolId, cls.id)}
                        className="font-medium text-primary hover:underline"
                      >
                        {cls.name}
                      </Link>
                      {cls.grouping ? (
                        <p className="text-[11px] text-muted-foreground">{cls.grouping}</p>
                      ) : null}
                    </td>
                    <td className="px-4 py-3">
                      <PriceListBadge
                        cls={cls}
                        priceLists={priceLists ?? []}
                        onAssign={setEditTarget}
                      />
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-sm text-muted-foreground">
                      {photos}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-sm text-muted-foreground">
                      {cls.albumCount}
                    </td>
                    <td className="px-4 py-3 text-center tabular-nums text-sm text-muted-foreground">
                      {cls.studentCount ?? 0}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <Badge variant="positive" className="text-[10px] px-1.5 py-0.5">
                        AI On
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => router.push(routes.dashboard.class(schoolId, cls.id))}
                        >
                          <Upload className="h-3.5 w-3.5" />
                          Upload photos
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 gap-1 text-xs"
                          onClick={() => router.push(routes.dashboard.class(schoolId, cls.id))}
                        >
                          <Tag className="h-3.5 w-3.5" />
                          Tag
                        </Button>
                        {confirmingId === cls.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="h-7 gap-1 text-xs"
                              disabled={deleteClass.isPending}
                              onClick={() => handleDelete(cls.id)}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 gap-1 text-xs"
                              disabled={deleteClass.isPending}
                              onClick={() => setConfirmingId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            title="Delete class"
                            onClick={() => setConfirmingId(cls.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <ClassFormSheet open={createOpen} onOpenChange={setCreateOpen} schoolId={schoolId} />
      <BulkClassSheet open={bulkOpen} onOpenChange={setBulkOpen} schoolId={schoolId} existingClasses={classes ?? []} />
      {editTarget ? (
        <ClassFormSheet
          open={!!editTarget}
          onOpenChange={(open) => { if (!open) setEditTarget(null); }}
          schoolId={schoolId}
          schoolClass={editTarget}
        />
      ) : null}
    </div>
  );
}
