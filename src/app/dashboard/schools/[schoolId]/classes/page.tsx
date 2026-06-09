"use client";

import { use } from "react";
import Link from "next/link";
import { ChevronRight, GraduationCap, Plus } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ClassFormSheet } from "@/components/dashboard";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolClasses } from "@/hooks/use-albums";
import { routes } from "@/config/routes";
import { useState } from "react";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolClassesPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: classes, isLoading } = useSchoolClasses(schoolId);
  const [createOpen, setCreateOpen] = useState(false);

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
        description="All classes registered under this school."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add class
          </Button>
        }
      />

      {isLoading ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : !classes || classes.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          title="No classes yet"
          description="Add the first class to this school."
          action={<Button onClick={() => setCreateOpen(true)}><Plus className="h-4 w-4" />Add class</Button>}
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {classes.map((cls) => (
            <Link key={cls.id} href={routes.dashboard.class(schoolId, cls.id)}>
              <Card className="h-full transition-shadow hover:shadow-md">
                <CardContent className="flex items-center gap-3 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{cls.name}</p>
                    <p className="text-xs text-muted-foreground">/{cls.slug}</p>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-xs tabular-nums">
                    {cls.albumCount} {cls.albumCount === 1 ? "album" : "albums"}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <ClassFormSheet open={createOpen} onOpenChange={setCreateOpen} schoolId={schoolId} />
    </div>
  );
}
