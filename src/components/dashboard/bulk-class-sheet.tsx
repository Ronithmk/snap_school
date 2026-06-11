"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, AlertCircle, Layers, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useCreateClass } from "@/hooks/use-albums";
import { usePriceLists } from "@/hooks/use-pricing";
import type { SchoolClass } from "@/types";

interface ParsedRow {
  name: string;
  grouping?: string;
  slug: string;
  duplicate: boolean;
}

const NO_PRICE_LIST = "__none__";

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
  existingClasses: SchoolClass[];
}

export function BulkClassSheet({ open, onOpenChange, schoolId, existingClasses }: Props) {
  const [text, setText] = useState("");
  const [priceListId, setPriceListId] = useState(NO_PRICE_LIST);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const createClass = useCreateClass(schoolId);
  const { data: priceLists } = usePriceLists(schoolId);

  const existingSlugs = useMemo(() => new Set(existingClasses.map((c) => c.slug)), [existingClasses]);

  const rows = useMemo<ParsedRow[]>(() => {
    const seenSlugs = new Set<string>();
    return text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [namePart, groupingPart] = line.split("|").map((p) => p.trim());
        const slug = slugify(namePart);
        const duplicate = existingSlugs.has(slug) || seenSlugs.has(slug);
        seenSlugs.add(slug);
        return { name: namePart, grouping: groupingPart || undefined, slug, duplicate };
      });
  }, [text, existingSlugs]);

  const validRows = rows.filter((r) => r.name && !r.duplicate);
  const skippedRows = rows.filter((r) => !r.name || r.duplicate);

  async function handleImport() {
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        await createClass.mutateAsync({
          name: row.name,
          slug: row.slug,
          grouping: row.grouping,
          priceListId: priceListId === NO_PRICE_LIST ? null : priceListId,
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
    setPriceListId(NO_PRICE_LIST);
    setResults(null);
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }}
      title="Bulk add classes"
      description="Paste one class name per line. Add an optional grouping with a pipe, e.g. “Grade 5A | Grade 5”."
      className="w-full max-w-2xl sm:max-w-2xl"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="bulk-class-names">Class names</Label>
          <Textarea
            id="bulk-class-names"
            rows={8}
            value={text}
            onChange={(e) => { setText(e.target.value); setResults(null); }}
            placeholder={"Grade 1A\nGrade 1B | Grade 1\nGrade 2A | Grade 2"}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bulk-class-price-list">Price list (applied to all)</Label>
          <Select id="bulk-class-price-list" value={priceListId} onChange={(e) => setPriceListId(e.target.value)}>
            <option value={NO_PRICE_LIST}>No price list assigned</option>
            {(priceLists ?? []).map((list) => (
              <option key={list.id} value={list.id}>
                {list.name} ({list.items.length} products)
              </option>
            ))}
          </Select>
        </div>

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
                    <TableHead>Name</TableHead>
                    <TableHead>Grouping</TableHead>
                    <TableHead>Slug</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((row, i) => (
                    <TableRow key={i} className={row.duplicate ? "bg-amber-50 dark:bg-amber-900/10" : ""}>
                      <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                      <TableCell className="text-sm">{row.name || <span className="italic text-muted-foreground">—</span>}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{row.grouping ?? "—"}</TableCell>
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
                {results.success} class{results.success === 1 ? "" : "es"} created{results.failed > 0 ? `, ${results.failed} failed` : ""}
              </div>
            ) : (
              <Button onClick={handleImport} disabled={validRows.length === 0 || importing} className="w-full">
                {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Layers className="h-4 w-4" />}
                Create {validRows.length} class{validRows.length === 1 ? "" : "es"}
              </Button>
            )}
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}
