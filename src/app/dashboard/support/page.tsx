"use client";

import { RouteGuard } from "@/components/auth/route-guard";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useSupportTickets, useUpdateSupportTicketStatus } from "@/hooks/use-support";
import { LifeBuoy } from "lucide-react";

export default function DashboardSupportPage() {
  return (
    <RouteGuard allowedRoles={["platform_admin"]}>
      <SupportInbox />
    </RouteGuard>
  );
}

function SupportInbox() {
  const { data: tickets, isLoading } = useSupportTickets();
  const updateStatus = useUpdateSupportTicketStatus();

  return (
    <div className="space-y-6">
      <PageHeader title="Support" description="Messages submitted through the public support form." />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !tickets || tickets.length === 0 ? (
        <EmptyState icon={LifeBuoy} title="No support tickets" description="Messages from the support form will appear here." />
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>From</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Received</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tickets.map((ticket) => (
              <TableRow key={ticket.id}>
                <TableCell>
                  <p className="text-sm font-medium">{ticket.name}</p>
                  <p className="text-xs text-muted-foreground">{ticket.email}</p>
                </TableCell>
                <TableCell className="text-sm">{ticket.subject}</TableCell>
                <TableCell className="max-w-sm">
                  <p className="line-clamp-2 text-sm text-muted-foreground">{ticket.message}</p>
                </TableCell>
                <TableCell>
                  <Badge variant={ticket.status === "resolved" ? "positive" : "warning"}>
                    {ticket.status === "resolved" ? "Resolved" : "Open"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground tabular-nums">
                  {new Date(ticket.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={updateStatus.isPending}
                    onClick={() =>
                      updateStatus.mutate({ ticketId: ticket.id, status: ticket.status === "resolved" ? "open" : "resolved" })
                    }
                  >
                    {ticket.status === "resolved" ? "Reopen" : "Mark resolved"}
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
