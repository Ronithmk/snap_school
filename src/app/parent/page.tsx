"use client";

import Link from "next/link";
import { ImageOff, Images, Plus, School, Sparkles, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useParentChildren } from "@/hooks/use-parent";
import { useSession } from "@/hooks/use-auth";
import { routes } from "@/config/routes";

export default function ParentHomePage() {
  const { data: children, isLoading } = useParentChildren();
  const { user } = useSession();

  const schoolCount = new Set((children ?? []).map((c) => c.schoolId)).size;
  const galleryCount = (children ?? []).filter((c) => c.albumId).length;

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      {/* Hero */}
      <section className="bg-gradient-hero relative overflow-hidden rounded-3xl px-6 py-10 text-white shadow-glow sm:px-10 sm:py-14">
        <div aria-hidden className="blob -right-16 -top-24 h-64 w-64 bg-white/20" />
        <div aria-hidden className="blob -bottom-24 left-10 h-56 w-56 bg-white/10" />
        <div className="relative space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur">
            <Sparkles className="h-3.5 w-3.5" />
            Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
          </span>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">My children</h1>
          <p className="max-w-md text-sm text-white/85">
            View each child&apos;s photo album, order prints, and download photos — all in one place.
          </p>
          <Link
            href={routes.parent.addChild()}
            className={buttonVariants({ variant: "glass", size: "sm", className: "mt-2 border-white/30 bg-white/15 text-white hover:bg-white/25" })}
          >
            <Plus className="h-4 w-4" />
            Add another child
          </Link>
        </div>
      </section>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard icon={Users} label="Linked children" value={children?.length ?? 0} delay="delay-75" />
        <StatCard icon={School} label="Schools" value={schoolCount} delay="delay-150" />
        <StatCard icon={Images} label="Active galleries" value={galleryCount} delay="delay-225" />
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-56 w-full rounded-3xl" />
          ))}
        </div>
      ) : !children || children.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No children linked yet"
          description="Link your first child using the username and access code provided by their school."
          action={
            <Link href={routes.parent.addChild()} className={buttonVariants({ variant: "default", size: "sm" })}>
              <Plus className="h-4 w-4" />
              Add a child
            </Link>
          }
        />
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child, i) => (
            <Card
              key={child.studentId}
              className={`glass-premium animate-fade-up overflow-hidden rounded-3xl delay-${Math.min(i, 3) * 75}`}
            >
              <div className="relative aspect-video w-full overflow-hidden bg-muted">
                {child.coverPhotoUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={child.coverPhotoUrl} alt={child.studentName} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                    <ImageOff className="h-6 w-6" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/0 to-black/0" />
                <div className="absolute inset-x-0 bottom-0 p-3">
                  <p className="text-sm font-semibold text-white drop-shadow">{child.studentName}</p>
                  <p className="text-xs text-white/80">{child.schoolName}</p>
                </div>
              </div>
              <CardContent className="pt-4">
                <Link
                  href={routes.storefront.parent(child.schoolSlug, child.studentId)}
                  className={buttonVariants({ variant: "default", size: "sm", className: "w-full justify-center" })}
                >
                  View album
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delay }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; delay: string }) {
  return (
    <Card className={`glass-premium animate-fade-up ${delay} rounded-2xl`}>
      <CardContent className="flex items-center gap-4 p-5">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[image:var(--gradient-primary)] text-white shadow-glow">
          <Icon className="h-5 w-5" />
        </span>
        <div>
          <p className="text-2xl font-semibold tabular-nums tracking-tight">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
