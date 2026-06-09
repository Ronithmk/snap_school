"use client";

import { use, useMemo, useState } from "react";
import Link from "next/link";
import { Copy, Search, Users } from "lucide-react";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useStudents } from "@/hooks/use-students";
import { useSchoolClasses } from "@/hooks/use-albums";
import { useSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

export default function SchoolParentalConnectionsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: students, isLoading: studentsLoading } = useStudents(schoolId);
  const { data: classes, isLoading: classesLoading } = useSchoolClasses(schoolId);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState<string>("__all__");
  const [copied, setCopied] = useState<string | null>(null);

  const classMap = useMemo(() => {
    if (!classes) return {} as Record<string, string>;
    return Object.fromEntries(classes.map((c) => [c.id, c.name]));
  }, [classes]);

  const filtered = useMemo(() => {
    if (!students) return [];
    const q = search.toLowerCase();
    return students.filter((s) => {
      const matchSearch = !q || s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q);
      const matchClass = classFilter === "__all__" || s.classId === classFilter;
      return matchSearch && matchClass;
    });
  }, [students, search, classFilter]);

  const copyCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  const isLoading = studentsLoading || classesLoading;

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Parental Connections</span>
      </nav>

      <PageHeader
        title="Parental Connections"
        description="Student access credentials for sharing with parents to view photos."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search students…" className="pl-9" />
        </div>
        {classes && classes.length > 0 && (
          <Select value={classFilter} onChange={(e) => setClassFilter(e.target.value)} containerClassName="sm:w-52">
            <option value="__all__">All classes</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        )}
      </div>

      {isLoading ? (
        <div className="space-y-2">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <EmptyState icon={Users} title="No students found" description="No students have been added to this school yet." />
      ) : (
        <>
          <div className="rounded-lg border bg-amber-50 px-4 py-3 dark:bg-amber-900/10">
            <p className="text-xs text-amber-700 dark:text-amber-400">
              Share each student&apos;s <strong>username</strong> and <strong>access code</strong> with their parent or guardian. These credentials let them log in and view their child&apos;s photos.
            </p>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>#</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Class</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Access Code</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((student) => (
                <TableRow key={student.id}>
                  <TableCell className="text-muted-foreground tabular-nums text-sm w-12">{student.number}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      {student.coverPhotoUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={student.coverPhotoUrl} alt={student.name} className="h-7 w-7 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                          {student.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm font-medium">{student.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-xs">{classMap[student.classId] ?? "—"}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{student.username}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(student.username)}>
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs tracking-widest">{student.accessCode}</code>
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copyCode(student.accessCode)}>
                        <Copy className={`h-3 w-3 ${copied === student.accessCode ? "text-green-500" : ""}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <p className="text-xs text-muted-foreground">{filtered.length} of {students?.length ?? 0} students</p>
        </>
      )}
    </div>
  );
}
