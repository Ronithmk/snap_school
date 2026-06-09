"use client";

import { use, useState } from "react";
import { Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { SkeletonGrid } from "@/components/shared/skeleton-grid";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCard, ClassCard } from "@/components/storefront/listing-cards";
import { useSchoolAlbums, useSchoolClasses } from "@/hooks/use-albums";
import { useSchoolBySlug } from "@/hooks/use-tenant";

interface TenantHomePageProps {
  params: Promise<{ school: string }>;
}

export default function TenantHomePage({ params }: TenantHomePageProps) {
  const { school: slug } = use(params);
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(slug);
  const { data: classes, isLoading: isClassesLoading } = useSchoolClasses(school?.id);
  const [search, setSearch] = useState("");
  const { data: albums, isLoading: isAlbumsLoading } = useSchoolAlbums(school?.id, { search: search || undefined });

  if (isSchoolLoading || !school) {
    return (
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <SkeletonGrid count={4} />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
      <PageHeader title={school.name} description={school.description ?? "Browse class albums and order your favorite photos."} />

      <section className="space-y-4">
        <h2 className="text-lg font-semibold tracking-tight">Classes</h2>
        {isClassesLoading || !classes ? (
          <SkeletonGrid count={4} />
        ) : classes.length === 0 ? (
          <EmptyState title="No classes published yet" description="Check back soon — this school hasn't published any classes." />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {classes.map((schoolClass) => (
              <ClassCard key={schoolClass.id} school={school} schoolClass={schoolClass} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold tracking-tight">All albums</h2>
          <div className="relative sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search albums…" className="pl-9" aria-label="Search albums" />
          </div>
        </div>
        {isAlbumsLoading || !albums ? (
          <SkeletonGrid count={8} />
        ) : albums.data.length === 0 ? (
          <EmptyState icon={Search} title="No albums found" description="Try a different search term, or check back later for new albums." />
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {albums.data.map((album) => (
              <AlbumCard key={album.id} school={school} album={album} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
