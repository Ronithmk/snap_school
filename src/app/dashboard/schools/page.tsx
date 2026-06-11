"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Building2, Plus, Search, Trash2 } from "lucide-react";
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
import { useSchools, useDeleteSchool } from "@/hooks/use-tenant";
import { SCHOOL_STATUS_LABELS, SCHOOL_STATUS_TONE } from "@/config/constants";
import { routes } from "@/config/routes";
import type { ApiError } from "@/types";

export default function DashboardSchoolsPage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useSchools(search || undefined);
  const [createOpen, setCreateOpen] = useState(false);
  const deleteSchool = useDeleteSchool();
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    try {
      await deleteSchool.mutateAsync(id);
      toast.success("School deleted.");
      setConfirmingId(null);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't delete the school. Please try again.");
    }
  }

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
              <TableHead className="w-px" />
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
                <TableCell className="text-right">
                  {confirmingId === school.id ? (
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        className="h-7 gap-1 text-xs"
                        disabled={deleteSchool.isPending}
                        onClick={() => handleDelete(school.id)}
                      >
                        Confirm
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 gap-1 text-xs"
                        disabled={deleteSchool.isPending}
                        onClick={() => setConfirmingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                      title="Delete school"
                      onClick={() => setConfirmingId(school.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </TableCell>
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
