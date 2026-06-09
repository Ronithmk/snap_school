"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Search, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStudents } from "@/hooks/use-students";
import { useSchoolClasses } from "@/hooks/use-albums";
import { useSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolStudentViewPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: students, isLoading: studentsLoading } = useStudents(schoolId);
  const { data: classes, isLoading: classesLoading } = useSchoolClasses(schoolId);
  const [search, setSearch] = useState("");

  const classMap = useMemo(() => {
    if (!classes) return {} as Record<string, string>;
    return Object.fromEntries(classes.map((c) => [c.id, c.name]));
  }, [classes]);

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = search.toLowerCase();
    return students.filter((s) =>
      !q || s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q) || s.number.includes(q)
    );
  }, [students, search]);

  const isLoading = studentsLoading || classesLoading;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Student View</span>
      </nav>

      <PageHeader
        title="Student View"
        description={`All students registered under ${school?.name ?? "this school"}.`}
      />

      <div className="relative sm:w-80">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students…" className="pl-9" />
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="No students match your search." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>#</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Class</TableHead>
              <TableHead>Username</TableHead>
              <TableHead>Access Code</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((student) => (
              <TableRow key={student.id}>
                <TableCell className="text-muted-foreground tabular-nums text-sm">{student.number}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2.5">
                    {student.coverPhotoUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={student.coverPhotoUrl} alt={student.name} className="h-7 w-7 rounded-full object-cover" />
                    ) : (
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
                        {student.name.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <span className="text-sm font-medium">{student.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="text-xs">{classMap[student.classId] ?? student.classId}</Badge>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{student.username}</code>
                </TableCell>
                <TableCell>
                  <code className="rounded bg-muted px-1.5 py-0.5 text-xs tracking-widest">{student.accessCode}</code>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
