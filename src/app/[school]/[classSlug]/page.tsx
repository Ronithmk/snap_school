"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonGrid } from "@/components/shared/skeleton-grid";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCard } from "@/components/storefront/listing-cards";
import { useClassBySlug, useSchoolAlbums } from "@/hooks/use-albums";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";

interface ClassPageProps {
  params: Promise<{ school: string; classSlug: string }>;
}

export default function ClassPage({ params }: ClassPageProps) {
  const { school: schoolSlug, classSlug } = use(params);
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(schoolSlug);
  const { data: schoolClass, isLoading: isClassLoading } = useClassBySlug(school?.id, classSlug);
  const { data: albums, isLoading: isAlbumsLoading } = useSchoolAlbums(school?.id, { classId: schoolClass?.id });

  if (isSchoolLoading || !school) {
    return (
      <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
        <Skeleton className="h-4 w-48" />
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <SkeletonGrid count={8} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-12">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.storefront.school(schoolSlug)} className="transition-colors hover:text-foreground">
          {school.name}
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{schoolClass?.name ?? "Class"}</span>
      </nav>

      {isClassLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
      ) : !schoolClass ? (
        <EmptyState title="Class not found" description="This class may have been removed or renamed." />
      ) : (
        <PageHeader
          title={schoolClass.name}
          description={schoolClass.grouping ? `${schoolClass.grouping} · ${schoolClass.albumCount} albums` : `${schoolClass.albumCount} albums`}
        />
      )}

      {isAlbumsLoading || !albums ? (
        <SkeletonGrid count={8} />
      ) : albums.data.length === 0 ? (
        <EmptyState title="No albums yet" description="Albums for this class will appear here once they're published." />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {albums.data.map((album) => (
            <AlbumCard key={album.id} school={school} album={album} />
          ))}
        </div>
      )}
    </div>
  );
}
