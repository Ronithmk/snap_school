"use client";

import { use, useState } from "react";
import Link from "next/link";
import { Camera, ImageIcon, Search, Sparkles, Tag, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { SkeletonGrid } from "@/components/shared/skeleton-grid";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { AlbumCard, ClassCard } from "@/components/storefront/listing-cards";
import { useSchoolAlbums, useSchoolClasses } from "@/hooks/use-albums";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { useContentBlocks } from "@/hooks/use-content";
import type { ContentBlock, AnnouncementStyle } from "@/types";

interface TenantHomePageProps {
  params: Promise<{ school: string }>;
}

// ── CMS block renderers ───────────────────────────────────────────

function isBlockActive(block: ContentBlock): boolean {
  const now = Date.now();
  if (block.startsAt && new Date(block.startsAt).getTime() > now) return false;
  if (block.endsAt && new Date(block.endsAt).getTime() < now) return false;
  return true;
}

const ANNOUNCEMENT_STYLES: Record<AnnouncementStyle, string> = {
  info:    "bg-blue-50 text-blue-800 border-blue-200 dark:bg-blue-900/20 dark:text-blue-200 dark:border-blue-800",
  success: "bg-green-50 text-green-800 border-green-200 dark:bg-green-900/20 dark:text-green-200 dark:border-green-800",
  warning: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-900/20 dark:text-amber-200 dark:border-amber-800",
  promo:   "bg-violet-50 text-violet-800 border-violet-200 dark:bg-violet-900/20 dark:text-violet-200 dark:border-violet-800",
};

function AnnouncementBar({ block }: { block: ContentBlock }) {
  const style = ANNOUNCEMENT_STYLES[block.announcementStyle ?? "info"];
  return (
    <div className={`border-b px-4 py-2.5 text-center text-sm ${style}`}>
      {block.title && <strong className="font-semibold">{block.title} </strong>}
      {block.body}
      {block.ctaLabel && block.ctaUrl && (
        <Link href={block.ctaUrl} className="ml-2 underline font-medium">{block.ctaLabel}</Link>
      )}
    </div>
  );
}

function HeroBanner({ block }: { block: ContentBlock }) {
  return (
    <div className="relative overflow-hidden rounded-xl">
      {block.imageUrl ? (
        <div className="relative h-48 sm:h-64">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={block.imageUrl} alt={block.title ?? ""} className="h-full w-full object-cover" />
          {(block.title || block.ctaLabel) && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40 text-white text-center px-6">
              {block.title && <h2 className="text-2xl font-bold tracking-tight drop-shadow">{block.title}</h2>}
              {block.subtitle && <p className="text-sm opacity-90 drop-shadow">{block.subtitle}</p>}
              {block.ctaLabel && block.ctaUrl && (
                <Link href={block.ctaUrl}
                  className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 transition-transform hover:scale-105">
                  {block.ctaLabel}
                </Link>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-8 text-center">
          {block.title && <h2 className="text-xl font-bold">{block.title}</h2>}
          {block.subtitle && <p className="mt-1 text-muted-foreground">{block.subtitle}</p>}
          {block.ctaLabel && block.ctaUrl && (
            <Link href={block.ctaUrl} className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
              {block.ctaLabel}
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

function PromotionCard({ block }: { block: ContentBlock }) {
  const style = ANNOUNCEMENT_STYLES[block.announcementStyle ?? "promo"];
  return (
    <div className={`flex flex-col gap-2 rounded-xl border p-4 ${style}`}>
      <div className="flex items-start gap-2">
        <Tag className="mt-0.5 h-4 w-4 shrink-0" />
        <div className="flex-1">
          {block.title && <p className="font-semibold text-sm">{block.title}</p>}
          {block.body && <p className="text-xs mt-0.5">{block.body}</p>}
        </div>
        {block.endsAt && (
          <p className="text-xs opacity-70 shrink-0">
            Until {new Date(block.endsAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
          </p>
        )}
      </div>
      {block.ctaLabel && block.ctaUrl && (
        <Link href={block.ctaUrl} className="self-start text-xs font-semibold underline">{block.ctaLabel}</Link>
      )}
    </div>
  );
}

function SponsorCard({ block }: { block: ContentBlock }) {
  const inner = (
    <div className="flex items-center gap-3 rounded-xl border bg-muted/30 px-4 py-3">
      {block.imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={block.imageUrl} alt={block.title ?? "Sponsor"} className="h-10 max-w-[100px] object-contain" />
      ) : (
        <div className="h-10 w-16 rounded bg-muted" />
      )}
      {block.title && <p className="text-xs text-muted-foreground">{block.title}</p>}
    </div>
  );
  return block.ctaUrl ? (
    <Link href={block.ctaUrl} target="_blank" rel="noreferrer sponsored">{inner}</Link>
  ) : inner;
}

// ── Page ──────────────────────────────────────────────────────────

export default function TenantHomePage({ params }: TenantHomePageProps) {
  const { school: slug } = use(params);
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(slug);
  const { data: classes, isLoading: isClassesLoading } = useSchoolClasses(school?.id);
  const [search, setSearch] = useState("");
  const { data: albums, isLoading: isAlbumsLoading } = useSchoolAlbums(school?.id, { search: search || undefined });
  const { data: allBlocks } = useContentBlocks(school?.id);

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

  const activeBlocks = (allBlocks ?? []).filter((b) => b.enabled && isBlockActive(b));
  const announcements = activeBlocks.filter((b) => b.type === "announcement");
  const banners = activeBlocks.filter((b) => b.type === "banner");
  const promotions = activeBlocks.filter((b) => b.type === "promotion");
  const sponsors = activeBlocks.filter((b) => b.type === "sponsor");

  const totalPhotos = (albums?.data ?? []).reduce((sum, a) => sum + a.photoCount, 0);
  const primaryColor = school.settings?.primaryColor;

  return (
    <>
      {/* Announcement bars — above all content */}
      {announcements.map((b) => <AnnouncementBar key={b.id} block={b} />)}

      {/* Default hero — only when the school hasn't configured a CMS banner */}
      {banners.length === 0 && (
        <div
          className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
          style={primaryColor ? { background: `linear-gradient(135deg, ${primaryColor}26, ${primaryColor}08, transparent)` } : undefined}
        >
          <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
          <div className="relative mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
              <Sparkles className="h-3.5 w-3.5" />
              Photo gallery & store
            </span>
            <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{school.name}</h1>
            <p className="mt-2 max-w-xl text-muted-foreground sm:text-lg">
              {school.description ?? "Browse class albums and order your favorite photos."}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3 text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 font-medium shadow-sm backdrop-blur">
                <ImageIcon className="h-4 w-4 text-primary" />
                {albums?.meta.total ?? albums?.data.length ?? 0} albums
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 font-medium shadow-sm backdrop-blur">
                <Camera className="h-4 w-4 text-primary" />
                {totalPhotos}+ photos
              </span>
              {classes && classes.length > 0 && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1.5 font-medium shadow-sm backdrop-blur">
                  <Users className="h-4 w-4 text-primary" />
                  {classes.length} {classes.length === 1 ? "class" : "classes"}
                </span>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
        {banners.length > 0 && (
          <div className="space-y-2">
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{school.name}</h1>
            {school.description && <p className="text-muted-foreground">{school.description}</p>}
          </div>
        )}

        {/* Hero banners */}
        {banners.length > 0 && (
          <div className="space-y-4">
            {banners.map((b) => <HeroBanner key={b.id} block={b} />)}
          </div>
        )}

        {/* Promotions */}
        {promotions.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {promotions.map((b) => <PromotionCard key={b.id} block={b} />)}
          </div>
        )}

        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <span className="h-5 w-1 rounded-full bg-primary" />
            <h2 className="text-lg font-semibold tracking-tight">Classes</h2>
          </div>
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
            <div className="flex items-center gap-2">
              <span className="h-5 w-1 rounded-full bg-primary" />
              <h2 className="text-lg font-semibold tracking-tight">All albums</h2>
            </div>
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

        {/* Sponsors */}
        {sponsors.length > 0 && (
          <section className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Our sponsors</h3>
            <div className="flex flex-wrap gap-3">
              {sponsors.map((b) => <SponsorCard key={b.id} block={b} />)}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
