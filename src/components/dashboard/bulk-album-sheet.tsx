"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Images, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAlbum } from "@/hooks/use-albums";
import type { Album, SchoolClass } from "@/types";

interface ParsedRow {
  title: string;
  slug: string;
  duplicate: boolean;
}

const NO_CLASS = "__none__";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  classes: SchoolClass[];
  existingAlbums: Album[];
}

export function BulkAlbumSheet({ open, onOpenChange, schoolId, classes, existingAlbums }: Props) {
  const [text, setText] = useState("");
  const [classId, setClassId] = useState(NO_CLASS);
  const [eventDate, setEventDate] = useState("");
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const createAlbum = useCreateAlbum(schoolId);

  const existingSlugs = useMemo(() => new Set(existingAlbums.map((a) => a.slug)), [existingAlbums]);

  const rows = useMemo<ParsedRow[]>(() => {
    const seenSlugs = new Set<string>();
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((title) => {
        const slug = slugify(title);
        const duplicate = existingSlugs.has(slug) || seenSlugs.has(slug);
        seenSlugs.add(slug);
        return { title, slug, duplicate };
      });
  }, [text, existingSlugs]);

  const validRows = rows.filter((r) => r.title && !r.duplicate);
  const skippedRows = rows.filter((r) => !r.title || r.duplicate);

  async function handleImport() {
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        await createAlbum.mutateAsync({
          title: row.title,
          slug: row.slug,
          classId: classId === NO_CLASS ? null : classId,
          visibility: "private",
          eventDate: eventDate ? new Date(eventDate).toISOString() : undefined,
        });
        success++;
      } catch {
        failed++;
      }
    }

    setImporting(false);
    setResults({ success, failed });
    if (failed === 0) {
      setTimeout(() => { onOpenChange(false); reset(); }, 1200);
    }
  }

  function reset() {
    setText("");
    setClassId(NO_CLASS);
    setEventDate("");
    setResults(null);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}
      title="Bulk add albums"
      description="Paste one album title per line — useful for creating an album per kid in a class."
      className="w-full max-w-2xl sm:max-w-2xl"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bulk-album-titles">Album titles</Label>
          <Textarea
            id="bulk-album-titles"
            rows={8}
            value={text}
            onChange={(e) => { setText(e.target.value); setResults(null); }}
            placeholder={"Aarav Sharma\nDiya Patel\nKabir Singh"}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bulk-album-class">Class (applied to all)</Label>
            <Select id="bulk-album-class" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value={NO_CLASS}>School-wide (no class)</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bulk-album-event-date">Event date (applied to all)</Label>
            <input
              id="bulk-album-event-date"
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          All albums are created private. Each is created without a student link — open an album afterwards to assign it to a student for access cards.
        </p>

        {rows.length > 0 ? (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{rows.length} rows</Badge>
              {validRows.length > 0 && <Badge variant="default">{validRows.length} ready</Badge>}
              {skippedRows.length > 0 && <Badge variant="warning">{skippedRows.length} skipped (duplicate)</Badge>}
            </div>

            <div className="max-h-72 overflow-y-auto rounded-xl border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-8">#</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} className={row.duplicate ? "bg-amber-50 dark:bg-amber-900/10" : ""}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="text-sm">{row.title || <span className="italic text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{row.slug}</TableCell>
                      <TableCell>
                        {row.duplicate ? (
                          <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                            <AlertCircle className="h-3 w-3" />Already exists
                          </span>
                        ) : (
                          <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {results ? (
              <div className={`flex items-center gap-2 rounded-lg px-4 py-3 text-sm ${results.failed === 0 ? "bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400"}`}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                {results.success} album{results.success === 1 ? "" : "s"} created{results.failed > 0 ? `, ${results.failed} failed` : ""}
              </div>
            ) : (
              <Button onClick={handleImport} disabled={validRows.length === 0 || importing} className="w-full">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
                Create {validRows.length} album{validRows.length === 1 ? "" : "s"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
