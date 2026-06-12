"use client";

import { use, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ImageOff, KeyRound, Loader2, Sparkles, Tag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSession } from "@/hooks/use-auth";
import { useParentChildren } from "@/hooks/use-parent";
import { useStudentLookup } from "@/hooks/use-students";
import { useSchoolBySlug } from "@/hooks/use-tenant";
import { useContentBlocks } from "@/hooks/use-content";
import { routes } from "@/config/routes";
import type { ApiError, ContentBlock, AnnouncementStyle } from "@/types";

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

// ── Gallery access gate ────────────────────────────────────────────

interface AccessCodeFormValues {
  username: string;
  accessCode: string;
}

function GalleryAccessForm({ schoolSlug }: { schoolSlug: string }) {
  const router = useRouter();
  const lookup = useStudentLookup();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AccessCodeFormValues>({ defaultValues: { username: "", accessCode: "" } });

  const onSubmit = handleSubmit(async (values) => {
    try {
      const result = await lookup.mutateAsync({ ...values, schoolSlug });
      router.push(routes.storefront.parent(schoolSlug, result.studentId));
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't find your gallery. Please check the details and try again.");
    }
  });

  return (
    <Card className="mx-auto max-w-sm border-border/60 shadow-sm">
      <CardContent className="space-y-4 p-6">
        <div className="space-y-1.5 text-center">
          <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
            <KeyRound className="h-5 w-5" />
          </span>
          <h2 className="text-lg font-semibold tracking-tight">View your gallery</h2>
          <p className="text-sm text-muted-foreground">
            Enter the username and access code from your child&apos;s access card to view their photos.
          </p>
        </div>

        <form onSubmit={onSubmit} noValidate className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="gallery-username">Username</Label>
            <Input id="gallery-username" autoComplete="off" placeholder="e.g. 1234567" {...register("username", { required: true })} />
            {errors.username && <p className="text-xs text-destructive">Username is required</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gallery-access-code">Access code</Label>
            <Input id="gallery-access-code" autoComplete="off" placeholder="e.g. AB12CD" {...register("accessCode", { required: true })} />
            {errors.accessCode && <p className="text-xs text-destructive">Access code is required</p>}
          </div>
          <Button type="submit" className="w-full" disabled={lookup.isPending}>
            {lookup.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
            View my gallery
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">
          Don&apos;t have an access code?{" "}
          <Link href={routes.parentRegister()} className="font-medium text-foreground underline-offset-2 hover:underline">
            Create a parent account
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}

function ChildPicker({ schoolSlug, children }: { schoolSlug: string; children: { studentId: string; studentName: string; coverPhotoUrl: string | null }[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="space-y-1.5 text-center">
        <h2 className="text-lg font-semibold tracking-tight">Choose your child</h2>
        <p className="text-sm text-muted-foreground">You have multiple children linked at this school — pick one to view their gallery.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {children.map((child) => (
          <Link key={child.studentId} href={routes.storefront.parent(schoolSlug, child.studentId)}>
            <Card className="overflow-hidden transition-colors hover:border-primary/40">
              <div className="aspect-video w-full overflow-hidden bg-muted">
                {child.coverPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={child.coverPhotoUrl} alt={child.studentName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <p className="font-medium">{child.studentName}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function TenantHomePage({ params }: TenantHomePageProps) {
  const { school: slug } = use(params);
  const router = useRouter();
  const { data: school, isLoading: isSchoolLoading } = useSchoolBySlug(slug);
  const { data: allBlocks } = useContentBlocks(school?.id);

  const { user, isLoading: isSessionLoading } = useSession();
  const isParent = user?.role === "parent";
  const { data: children, isLoading: isChildrenLoading } = useParentChildren({ enabled: isParent });
  const schoolChildren = (children ?? []).filter((c) => c.schoolSlug === slug);

  useEffect(() => {
    if (isParent && schoolChildren.length === 1) {
      router.replace(routes.storefront.parent(slug, schoolChildren[0].studentId));
    }
  }, [isParent, schoolChildren, slug, router]);

  const isLoading =
    isSchoolLoading || isSessionLoading || (isParent && isChildrenLoading) || (isParent && schoolChildren.length === 1);

  if (isLoading || !school) {
    return (
      <div className="mx-auto max-w-3xl space-y-6 px-4 py-12 sm:px-6">
        <div className="space-y-2 text-center">
          <Skeleton className="mx-auto h-8 w-64" />
          <Skeleton className="mx-auto h-4 w-96" />
        </div>
        <Skeleton className="mx-auto h-64 max-w-sm" />
      </div>
    );
  }

  const activeBlocks = (allBlocks ?? []).filter((b) => b.enabled && isBlockActive(b));
  const announcements = activeBlocks.filter((b) => b.type === "announcement");
  const banners = activeBlocks.filter((b) => b.type === "banner");
  const promotions = activeBlocks.filter((b) => b.type === "promotion");
  const sponsors = activeBlocks.filter((b) => b.type === "sponsor");

  const primaryColor = school.settings?.primaryColor;

  return (
    <>
      {/* Announcement bars — above all content */}
      {announcements.map((b) => <AnnouncementBar key={b.id} block={b} />)}

      <div
        className="relative overflow-hidden border-b border-border/50 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent"
        style={primaryColor ? { background: `linear-gradient(135deg, ${primaryColor}26, ${primaryColor}08, transparent)` } : undefined}
      >
        <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 left-1/4 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 py-12 text-center sm:px-6 sm:py-16">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-background/60 px-3 py-1 text-xs font-medium text-primary backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Photo gallery & store
          </span>
          <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">{school.name}</h1>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground sm:text-lg">
            {school.description ?? "View and order your child's school photos."}
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-10 px-4 py-8 sm:px-6 sm:py-12">
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

        {isParent && schoolChildren.length > 1 ? (
          <ChildPicker schoolSlug={slug} children={schoolChildren} />
        ) : (
          <GalleryAccessForm schoolSlug={slug} />
        )}

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
