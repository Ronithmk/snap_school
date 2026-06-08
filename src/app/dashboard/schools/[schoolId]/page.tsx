"use client";

import { use, useState } from "react";
import Link from "next/link";
import { ChevronRight, ExternalLink, GraduationCap, ImageIcon, Pencil, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlbumFormSheet, ClassFormSheet, SchoolFormSheet } from "@/components/dashboard";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolAlbums, useSchoolClasses } from "@/hooks/use-albums";
import { ALBUM_VISIBILITY_LABELS, ALBUM_VISIBILITY_TONE, SCHOOL_STATUS_LABELS, SCHOOL_STATUS_TONE } from "@/config/constants";
import { routes } from "@/config/routes";
import { cn } from "@/lib/utils";

interface SchoolDetailPageProps {
  params: Promise<{ schoolId: string }>;
}

export default function SchoolDetailPage({ params }: SchoolDetailPageProps) {
  const { schoolId } = use(params);
  const { data: school, isLoading } = useSchool(schoolId);
  const { data: classes, isLoading: isClassesLoading } = useSchoolClasses(schoolId);
  const { data: albums, isLoading: isAlbumsLoading } = useSchoolAlbums(schoolId);

  const [tab, setTab] = useState("classes");
  const [editOpen, setEditOpen] = useState(false);
  const [createClassOpen, setCreateClassOpen] = useState(false);
  const [createAlbumOpen, setCreateAlbumOpen] = useState(false);

  if (isLoading || !school) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-72 w-full rounded-xl" />
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
        <span className="truncate text-foreground">{school.name}</span>
      </nav>

      <PageHeader
        title={school.name}
        description={school.description ?? `/${school.slug}`}
        actions={
          <>
            <Link href={routes.storefront.school(school.slug)} target="_blank" className={buttonVariants({ variant: "outline" })}>
              <ExternalLink className="h-4 w-4" />
              View storefront
            </Link>
            <Button onClick={() => setEditOpen(true)}>
              <Pencil className="h-4 w-4" />
              Edit school
            </Button>
          </>
        }
      />

      <Card>
        <CardContent className="flex flex-wrap items-center gap-x-8 gap-y-4 p-5">
          <div className="flex items-center gap-3">
            <Avatar src={school.logoUrl} alt={school.name} fallback={school.name.charAt(0)} className="h-12 w-12" />
            <div>
              <p className="text-sm font-medium">{school.name}</p>
              <p className="text-xs text-muted-foreground">/{school.slug}</p>
            </div>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Status</p>
            <Badge variant={SCHOOL_STATUS_TONE[school.status]}>{SCHOOL_STATUS_LABELS[school.status]}</Badge>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Country / Currency</p>
            <p className="text-sm font-medium">{school.settings.countryCode} · {school.settings.currencyCode}</p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Tax</p>
            <p className="text-sm font-medium">
              {school.settings.tax.enabled ? `${school.settings.tax.label} · ${school.settings.tax.rate}%` : "Not charged"}
            </p>
          </div>
          <div className="space-y-0.5">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Support email</p>
            <p className="text-sm font-medium">{school.settings.supportEmail ?? "—"}</p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={setTab}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <TabsList>
            <TabsTrigger value="classes">Classes ({school.classCount})</TabsTrigger>
            <TabsTrigger value="albums">Albums ({school.albumCount})</TabsTrigger>
          </TabsList>
          {tab === "classes" ? (
            <Button size="sm" onClick={() => setCreateClassOpen(true)}>
              <Plus className="h-4 w-4" />
              Add class
            </Button>
          ) : (
            <Button size="sm" onClick={() => setCreateAlbumOpen(true)}>
              <Plus className="h-4 w-4" />
              Add album
            </Button>
          )}
        </div>

        <TabsContent value="classes">
          {isClassesLoading || !classes ? (
            <div className="space-y-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : classes.length === 0 ? (
            <EmptyState
              icon={GraduationCap}
              title="No classes yet"
              description="Create a class to start organizing albums by grade, group, or event."
              action={
                <Button onClick={() => setCreateClassOpen(true)}>
                  <Plus className="h-4 w-4" />
                  Add class
                </Button>
              }
            />
          ) : (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {classes.map((schoolClass) => (
                <Link
                  key={schoolClass.id}
                  href={routes.dashboard.class(schoolId, schoolClass.id)}
                  className="group rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <p className="truncate text-sm font-medium">{schoolClass.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {[schoolClass.grouping, `${schoolClass.albumCount} albums`, schoolClass.studentCount ? `${schoolClass.studentCount} students` : null]
                      .filter(Boolean)
                      .join(" · ")}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="albums">
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
              description="Create an album, then upload photos for families to browse and order."
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
        </TabsContent>
      </Tabs>

      <SchoolFormSheet open={editOpen} onOpenChange={setEditOpen} school={school} />
      <ClassFormSheet open={createClassOpen} onOpenChange={setCreateClassOpen} schoolId={schoolId} />
      <AlbumFormSheet open={createAlbumOpen} onOpenChange={setCreateAlbumOpen} schoolId={schoolId} classes={classes ?? []} />
    </div>
  );
}
