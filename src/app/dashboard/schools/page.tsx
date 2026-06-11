"use client";

import { useState } from "react";
import Link from "next/link";
import { Building2, Plus, Search } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SchoolFormSheet } from "@/components/dashboard";
import { RouteGuard } from "@/components/auth/route-guard";
import { useSchools } from "@/hooks/use-tenant";
import { SCHOOL_STATUS_LABELS, SCHOOL_STATUS_TONE } from "@/config/constants";
import { routes } from "@/config/routes";

export default function DashboardSchoolsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSchools(search || undefined);
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <RouteGuard allowedRoles={["platform_admin"]}>
    <div className="space-y-6">
      <PageHeader
        title="Schools"
        description="Manage tenant storefronts, classes, and albums."
        actions={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4" />
            Add school
          </Button>
        }
      />

      <div className="relative sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search schools…" className="pl-9" aria-label="Search schools" />
      </div>

      {isLoading || !data ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No schools found"
          description="Try a different search term, or add a new school to get started."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add school
            </Button>
          }
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>School</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Country</TableHead>
              <TableHead className="text-right">Classes</TableHead>
              <TableHead className="text-right">Albums</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((school) => (
              <TableRow key={school.id} className="cursor-pointer">
                <TableCell>
                  <Link href={routes.dashboard.school(school.id)} className="flex items-center gap-3">
                    <Avatar src={school.logoUrl} alt={school.name} fallback={school.name.charAt(0)} className="h-9 w-9 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{school.name}</p>
                      <p className="truncate text-xs text-muted-foreground">/{school.slug}</p>
                    </div>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant={SCHOOL_STATUS_TONE[school.status]}>{SCHOOL_STATUS_LABELS[school.status]}</Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">{school.settings.countryCode}</TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">{school.classCount}</TableCell>
                <TableCell className="text-right text-sm font-medium tabular-nums">{school.albumCount}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      <SchoolFormSheet open={createOpen} onOpenChange={setCreateOpen} />
    </div>
    </RouteGuard>
  );
}
