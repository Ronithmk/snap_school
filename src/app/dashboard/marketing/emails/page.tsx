"use client";

import { useState } from "react";
import { Download, Loader2, Mail, Search, UserPlus, UserX } from "lucide-react";
import { RouteGuard } from "@/components/auth/route-guard";
import { StatCard } from "@/components/dashboard";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useExportMarketingEmailsCsv, useMarketingEmails, useSetMarketingOptOut } from "@/hooks/use-marketing";
import { useSchools } from "@/hooks/use-tenant";

const ALL_SCHOOLS = "__all__";

export default function DashboardMarketingEmailsPage() {
  return (
    <RouteGuard allowedRoles={["platform_admin"]}>
      <MailingList />
    </RouteGuard>
  );
}

function MailingList() {
  const [search, setSearch] = useState("");
  const [schoolId, setSchoolId] = useState(ALL_SCHOOLS);

  const { data, isLoading } = useMarketingEmails({
    search: search || undefined,
    schoolId: schoolId === ALL_SCHOOLS ? undefined : schoolId,
  });
  const { data: schools } = useSchools();
  const exportCsv = useExportMarketingEmailsCsv();
  const setOptOut = useSetMarketingOptOut();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Mailing List"
        description="Emails captured from parent sign-ups, for future marketing campaigns."
        actions={
          <Button variant="outline" onClick={() => exportCsv.mutate()} disabled={exportCsv.isPending}>
            {exportCsv.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            Export CSV
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-3">
        {isLoading || !data ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total subscribers" value={data.stats.total.toString()} icon={Mail} />
            <StatCard label="New in last 30 days" value={data.stats.last30Days.toString()} icon={UserPlus} />
            <StatCard label="Opted out" value={data.stats.optedOut.toString()} icon={UserX} />
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative sm:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
            aria-label="Search mailing list"
          />
        </div>
        <Select value={schoolId} onChange={(e) => setSchoolId(e.target.value)} containerClassName="sm:w-56" aria-label="Filter by school">
          <option value={ALL_SCHOOLS}>All schools</option>
          {(schools?.data ?? []).map((school) => (
            <option key={school.id} value={school.id}>
              {school.name}
            </option>
          ))}
        </Select>
      </div>

      {isLoading || !data ? (
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : data.data.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No emails captured yet"
          description="Emails will appear here as parents register for their child's school."
        />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>School</TableHead>
              <TableHead className="text-right">Signed up</TableHead>
              <TableHead className="text-right">Subscribed</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.data.map((entry) => (
              <TableRow key={entry.id} data-testid="marketing-email-row">
                <TableCell className="text-sm font-medium">{entry.name}</TableCell>
                <TableCell className="text-sm text-muted-foreground">{entry.email}</TableCell>
                <TableCell>
                  {entry.schoolNames.length === 0 ? (
                    <span className="text-sm text-muted-foreground">—</span>
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {entry.schoolNames.map((name) => (
                        <Badge key={name} variant="secondary">
                          {name}
                        </Badge>
                      ))}
                    </div>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {new Date(entry.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell className="text-right">
                  <Switch
                    checked={!entry.marketingOptOut}
                    onCheckedChange={(checked) => setOptOut.mutate({ userId: entry.id, marketingOptOut: !checked })}
                    aria-label={entry.marketingOptOut ? "Resubscribe to marketing emails" : "Opt out of marketing emails"}
                    className="ml-auto"
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
