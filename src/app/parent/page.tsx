"use client";

import Link from "next/link";
import { ImageOff, Plus, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { buttonVariants } from "@/components/ui/button";
import { useParentChildren } from "@/hooks/use-parent";
import { routes } from "@/config/routes";

export default function ParentHomePage() {
  const { data: children, isLoading } = useParentChildren();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        title="My children"
        description="View each child's photo album, order prints, and download photos."
        actions={
          <Link href={routes.parent.addChild()} className={buttonVariants({ variant: "outline", size: "sm" })}>
            <Plus className="h-4 w-4" />
            Add another child
          </Link>
        }
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-2xl" />
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
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {children.map((child) => (
            <Card key={child.studentId} className="overflow-hidden">
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
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{child.studentName}</p>
                  <p className="text-sm text-muted-foreground">{child.schoolName}</p>
                </div>
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
