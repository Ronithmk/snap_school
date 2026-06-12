"use client";

import { use, useState, useMemo, useCallback } from "react";
import {
  Archive,
  CheckCheck,
  ChevronDown,
  ChevronRight,
  Download,
  Filter,
  Loader2,
  Printer,
  Search,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { KNOWN_SIZES, sizeOrder } from "@/lib/print-size";
import { usePrintQueue, useUpdatePrintStatus, useGenerateZip } from "@/hooks/use-print-queue";
import type { PrintJob } from "@/hooks/use-print-queue";

// ── Helpers ────────────────────────────────────────────────────────

const STATUS_META: Record<string, { label: string; variant: "warning" | "default" | "positive" | "secondary" | "neutral" }> = {
  paid:        { label: "Ready to Print", variant: "warning" },
  cod:         { label: "Ready to Print (COD)", variant: "warning" },
  processing:  { label: "Printing",       variant: "default" },
  completed:   { label: "Completed",      variant: "positive" },
  shipped:     { label: "Shipped",        variant: "positive" },
};

function statusMeta(s: string) {
  return STATUS_META[s] ?? { label: s, variant: "neutral" as const };
}

// ── Stat card ──────────────────────────────────────────────────────

function StatCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="flex flex-col gap-0.5 rounded-xl border bg-card px-5 py-4 min-w-[120px]">
      <span className={cn("text-2xl font-bold tabular-nums", color)}>{value}</span>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}

// ── Job row ────────────────────────────────────────────────────────

function JobRow({
  job,
  selected,
  onToggle,
}: {
  job: PrintJob;
  selected: boolean;
  onToggle: () => void;
}) {
  const sm = statusMeta(job.orderStatus);
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-transparent px-3 py-2.5 transition-colors hover:bg-accent/40 has-[:checked]:border-primary/30 has-[:checked]:bg-primary/5">
      <input
        type="checkbox"
        checked={selected}
        onChange={onToggle}
        className="mt-1 h-4 w-4 shrink-0 accent-primary"
      />
      {/* Thumbnail */}
      <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md border bg-muted">
        {job.thumbnailUrl ? (
          <img src={job.thumbnailUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <Archive className="h-5 w-5" />
          </div>
        )}
      </div>
      {/* Details */}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted-foreground">{job.orderNumber}</span>
          <span className="text-sm font-medium truncate">{job.albumTitle || "—"}</span>
          <Badge variant={sm.variant} className="text-[10px] py-0">{sm.label}</Badge>
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span>{job.customerName}</span>
          <span className="text-primary/70">{job.itemName}</span>
          <span className="font-semibold text-foreground">Qty: {job.quantity}</span>
          <span>{new Date(job.placedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </label>
  );
}

// ── Size group ─────────────────────────────────────────────────────

function SizeGroup({
  size,
  jobs,
  selectedKeys,
  onToggleJob,
  onToggleAll,
  onZipGroup,
  onMarkGroup,
  isZipping,
}: {
  size: string;
  jobs: PrintJob[];
  selectedKeys: Set<string>;
  onToggleJob: (key: string) => void;
  onToggleAll: (keys: string[]) => void;
  onZipGroup: () => void;
  onMarkGroup: () => void;
  isZipping: boolean;
}) {
  const [open, setOpen] = useState(true);
  const keys = jobs.map((j) => j.key);
  const allSelected = keys.every((k) => selectedKeys.has(k));
  const someSelected = keys.some((k) => selectedKeys.has(k));
  const totalPrints = jobs.reduce((s, j) => s + j.quantity, 0);

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      {/* Group header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/40 border-b">
        <button type="button" onClick={() => setOpen((v) => !v)} className="flex items-center gap-2 flex-1 min-w-0">
          {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <span className="font-semibold text-sm">{size}</span>
          <span className="text-xs text-muted-foreground">
            {jobs.length} order{jobs.length !== 1 ? "s" : ""} · {totalPrints} print{totalPrints !== 1 ? "s" : ""}
          </span>
        </button>
        <div className="flex items-center gap-2 shrink-0">
          <label className="flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => { if (el) el.indeterminate = someSelected && !allSelected; }}
              onChange={() => onToggleAll(keys)}
              className="h-3.5 w-3.5 accent-primary"
            />
            All
          </label>
          <Button size="sm" variant="outline" onClick={onZipGroup} disabled={isZipping} className="h-7 gap-1.5 text-xs">
            {isZipping ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            ZIP
          </Button>
          <Button size="sm" variant="outline" onClick={onMarkGroup} className="h-7 gap-1.5 text-xs">
            <CheckCheck className="h-3 w-3" />
            Done
          </Button>
        </div>
      </div>
      {/* Rows */}
      {open && (
        <div className="flex flex-col divide-y">
          {jobs.map((job) => (
            <JobRow
              key={job.key}
              job={job}
              selected={selectedKeys.has(job.key)}
              onToggle={() => onToggleJob(job.key)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── ZIP progress overlay ───────────────────────────────────────────

function ZipProgress({ pct, label }: { pct: number; label: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-2xl border bg-card px-10 py-8 shadow-xl min-w-[280px]">
        <Printer className="h-10 w-10 text-primary animate-pulse" />
        <p className="font-semibold text-center">{label}</p>
        <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all duration-300"
            style={{ width: `${Math.round(pct * 100)}%` }}
          />
        </div>
        <p className="text-sm text-muted-foreground tabular-nums">
          {pct < 1 ? `${Math.round(pct * 100)}%` : "Preparing download…"}
        </p>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────

export default function PrintQueuePage({ params }: { params: Promise<{ schoolId: string }> }) {
  const { schoolId } = use(params);

  const [search, setSearch] = useState("");
  const [sizeFilter, setSizeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("pending");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [zipProgress, setZipProgress] = useState<{ active: boolean; pct: number; label: string }>({
    active: false, pct: 0, label: "",
  });

  const apiStatus = statusFilter === "pending" ? "paid,cod" : statusFilter === "all" ? undefined : statusFilter;

  const { data, isLoading, error } = usePrintQueue(schoolId, {
    status: apiStatus,
    size: sizeFilter === "all" ? undefined : sizeFilter,
    search: search || undefined,
  });

  const updateStatus = useUpdatePrintStatus(schoolId);
  const generateZip = useGenerateZip(schoolId);

  // Group jobs by size
  const grouped = useMemo(() => {
    const jobs = data?.jobs ?? [];
    const map = new Map<string, PrintJob[]>();
    for (const job of jobs) {
      const arr = map.get(job.size) ?? [];
      arr.push(job);
      map.set(job.size, arr);
    }
    return [...map.entries()].sort((a, b) => sizeOrder(a[0]) - sizeOrder(b[0]));
  }, [data?.jobs]);

  const allKeys = useMemo(() => (data?.jobs ?? []).map((j) => j.key), [data?.jobs]);

  const toggleJob = useCallback((key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }, []);

  const toggleGroup = useCallback((keys: string[]) => {
    setSelectedKeys((prev) => {
      const allIn = keys.every((k) => prev.has(k));
      const next = new Set(prev);
      allIn ? keys.forEach((k) => next.delete(k)) : keys.forEach((k) => next.add(k));
      return next;
    });
  }, []);

  const toggleAll = () => {
    setSelectedKeys((prev) =>
      prev.size === allKeys.length ? new Set() : new Set(allKeys),
    );
  };

  const selectedJobs = useMemo(
    () => (data?.jobs ?? []).filter((j) => selectedKeys.has(j.key)),
    [data?.jobs, selectedKeys],
  );

  const selectedOrderIds = useMemo(
    () => [...new Set(selectedJobs.map((j) => j.orderId))],
    [selectedJobs],
  );

  async function handleZip(opts: { orderIds?: string[]; sizeGroup?: string; label: string }) {
    setZipProgress({ active: true, pct: 0, label: `Building ${opts.label} ZIP…` });
    try {
      await generateZip.mutateAsync({
        orderIds: opts.orderIds,
        sizeGroup: opts.sizeGroup,
        onProgress: (pct) => setZipProgress((p) => ({ ...p, pct })),
      });
      toast.success("ZIP downloaded.");
    } catch (e: any) {
      toast.error(e.message ?? "Failed to generate ZIP.");
    } finally {
      setZipProgress({ active: false, pct: 0, label: "" });
      setSelectedKeys(new Set());
    }
  }

  async function handleMarkDone(orderIds: string[]) {
    try {
      await updateStatus.mutateAsync({ orderIds, status: "completed" });
      toast.success(`${orderIds.length} order(s) marked as completed.`);
      setSelectedKeys((prev) => {
        const next = new Set(prev);
        (data?.jobs ?? [])
          .filter((j) => orderIds.includes(j.orderId))
          .forEach((j) => next.delete(j.key));
        return next;
      });
    } catch {
      toast.error("Failed to update status.");
    }
  }

  const stats = data?.stats ?? { pending: 0, printing: 0, completed: 0 };
  const totalSelected = selectedJobs.reduce((s, j) => s + j.quantity, 0);

  return (
    <>
      {zipProgress.active && <ZipProgress pct={zipProgress.pct} label={zipProgress.label} />}

      <div className="flex flex-col gap-6 p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Printer className="h-6 w-6" /> Print Queue
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Manage and batch-download print-ready files grouped by size.
            </p>
          </div>
          <Button
            onClick={() => handleZip({ label: "all" })}
            disabled={generateZip.isPending || !data?.jobs.length}
            className="gap-2 shrink-0"
          >
            <Download className="h-4 w-4" />
            Download All
          </Button>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3">
          <StatCard label="Ready to Print" value={stats.pending} color="text-amber-600" />
          <StatCard label="Printing" value={stats.printing} color="text-blue-600" />
          <StatCard label="Completed" value={stats.completed} color="text-emerald-600" />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search order, customer, album…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status filter */}
          <div className="flex gap-1">
            {[
              { key: "pending", label: "Pending" },
              { key: "processing", label: "Printing" },
              { key: "completed", label: "Completed" },
              { key: "all", label: "All" },
            ].map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setStatusFilter(key)}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  statusFilter === key
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Size filter */}
          <div className="flex flex-wrap gap-1">
            <button
              type="button"
              onClick={() => setSizeFilter("all")}
              className={cn(
                "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                sizeFilter === "all"
                  ? "bg-secondary text-secondary-foreground border-secondary"
                  : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
              )}
            >
              All sizes
            </button>
            {grouped.map(([size]) => (
              <button
                key={size}
                type="button"
                onClick={() => setSizeFilter((prev) => (prev === size ? "all" : size))}
                className={cn(
                  "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                  sizeFilter === size
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "border-border text-muted-foreground hover:border-foreground hover:text-foreground",
                )}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Select all bar */}
        {(data?.jobs.length ?? 0) > 0 && (
          <div className="flex items-center gap-3 text-sm">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={selectedKeys.size === allKeys.length && allKeys.length > 0}
                ref={(el) => {
                  if (el) el.indeterminate = selectedKeys.size > 0 && selectedKeys.size < allKeys.length;
                }}
                onChange={toggleAll}
                className="h-4 w-4 accent-primary"
              />
              <span className="text-muted-foreground">
                {selectedKeys.size === 0 ? "Select all" : `${selectedKeys.size} selected`}
              </span>
            </label>
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-muted-foreground gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading print jobs…
          </div>
        ) : error ? (
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive text-center">
            Failed to load print queue.
          </div>
        ) : grouped.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-20 gap-3 text-muted-foreground">
            <Printer className="h-10 w-10 opacity-30" />
            <p className="font-medium">No print jobs found</p>
            <p className="text-sm">Orders will appear here once customers complete payment.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {grouped.map(([size, jobs]) => {
              const orderIds = [...new Set(jobs.map((j) => j.orderId))];
              return (
                <SizeGroup
                  key={size}
                  size={size}
                  jobs={jobs}
                  selectedKeys={selectedKeys}
                  onToggleJob={toggleJob}
                  onToggleAll={toggleGroup}
                  onZipGroup={() => handleZip({ sizeGroup: size, label: size })}
                  onMarkGroup={() => handleMarkDone(orderIds)}
                  isZipping={generateZip.isPending}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky bulk action bar */}
      {selectedKeys.size > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border bg-card shadow-xl px-5 py-3">
          <span className="text-sm font-medium whitespace-nowrap">
            {selectedKeys.size} item{selectedKeys.size !== 1 ? "s" : ""}
            {totalSelected > selectedKeys.size ? ` · ${totalSelected} prints` : ""}
          </span>
          <div className="h-4 w-px bg-border" />
          <Button
            size="sm"
            variant="outline"
            onClick={() => setSelectedKeys(new Set())}
            className="gap-1.5"
          >
            <X className="h-3.5 w-3.5" /> Clear
          </Button>
          <Button
            size="sm"
            onClick={() =>
              handleZip({
                orderIds: selectedOrderIds,
                label: `${selectedKeys.size} selected`,
              })
            }
            disabled={generateZip.isPending}
            className="gap-1.5"
          >
            {generateZip.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Download className="h-3.5 w-3.5" />
            )}
            Download ZIP
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleMarkDone(selectedOrderIds)}
            disabled={updateStatus.isPending}
            className="gap-1.5"
          >
            {updateStatus.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <CheckCheck className="h-3.5 w-3.5" />
            )}
            Mark Printed
          </Button>
        </div>
      )}
    </>
  );
}
