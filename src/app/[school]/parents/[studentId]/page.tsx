"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useStudentAlbum } from "@/hooks/use-students";
import { PHOTO_CATEGORY_OPTIONS } from "@/config/constants";
import { routes } from "@/config/routes";
import type { Photo } from "@/types";

interface ParentLandingPageProps {
  params: Promise<{ school: string; studentId: string }>;
}

const CATEGORY_LABELS: Record<string, string> = Object.fromEntries(
  PHOTO_CATEGORY_OPTIONS.map((opt) => [opt.value, opt.label]),
);

function categoryLabel(category: string | null | undefined): string {
  return CATEGORY_LABELS[category ?? ""] ?? category ?? "Other";
}

export default function ParentLandingPage({ params }: ParentLandingPageProps) {
  const { school: schoolSlug, studentId } = use(params);
  const { data, isLoading } = useStudentAlbum(studentId);

  if (isLoading) return <LoadingSkeleton />;

  if (!data || !data.student) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState title="Student not found" description="This link may be invalid or expired." />
      </div>
    );
  }

  const { student, album, photos } = data;

  if (!album || photos.length === 0) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <EmptyState
          title={`Hi, ${student.name}!`}
          description="Photos for this student haven't been published yet. Please check back soon."
        />
      </div>
    );
  }

  // Group photos by category, preserving first-seen order
  const groups = new Map<string, Photo[]>();
  for (const photo of photos) {
    const key = photo.category ?? "";
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(photo);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Hi, {student.name}! 👋</h1>
        <p className="text-sm text-muted-foreground">
          Browse {album.title}&apos;s photos below. Tap &quot;Buy this photo&quot; to see products available for it.
        </p>
      </div>

      {Array.from(groups.entries()).map(([category, groupPhotos]) => (
        <section key={category || "uncategorized"} className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">{categoryLabel(category)}</h2>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {groupPhotos.map((photo) => (
              <div key={photo.id} className="space-y-2">
                <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
                  <Image
                    src={photo.thumbnailUrl}
                    alt={photo.fileName}
                    fill
                    loading="lazy"
                    sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <Link
                  href={routes.storefront.albumPhoto(schoolSlug, album.id, photo.id)}
                  className={buttonVariants({ variant: "default", size: "sm", className: "w-full justify-center" })}
                >
                  <ShoppingBag className="h-3.5 w-3.5" />
                  Buy this photo
                </Link>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="mx-auto max-w-5xl space-y-8 px-4 py-8 sm:px-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}
