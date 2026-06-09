"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Sheet } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useCreateStudent } from "@/hooks/use-students";

interface ParsedRow {
  name: string;
  number: string;
  coverPhotoUrl?: string;
  error?: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  classId: string;
}

const TEMPLATE_CSV = `name,number,photo_url\nAlex Johnson,001,\nMaria Garcia,002,\nSam Lee,003,`;

function parseCSV(text: string): ParsedRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const header = lines[0].toLowerCase().split(",").map((h) => h.trim());
  const nameIdx = header.findIndex((h) => h.includes("name"));
  const numberIdx = header.findIndex((h) => h.includes("number") || h.includes("num") || h.includes("no"));
  const photoIdx = header.findIndex((h) => h.includes("photo") || h.includes("url") || h.includes("image"));

  if (nameIdx === -1) return [];

  return lines.slice(1).map((line, i) => {
    const cols = line.split(",").map((c) => c.trim().replace(/^["']|["']$/g, ""));
    const name = nameIdx !== -1 ? cols[nameIdx] : "";
    const number = numberIdx !== -1 ? cols[numberIdx] : String(i + 1).padStart(3, "0");
    const coverPhotoUrl = photoIdx !== -1 && cols[photoIdx] ? cols[photoIdx] : undefined;

    if (!name) return { name, number, coverPhotoUrl, error: "Name is required" };
    return { name, number: number || String(i + 1).padStart(3, "0"), coverPhotoUrl };
  }).filter((r) => r.name || r.error);
}

function downloadTemplate() {
  const blob = new Blob([TEMPLATE_CSV], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "students_template.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function StudentImportSheet({ open, onOpenChange, schoolId, classId }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
  const createStudent = useCreateStudent(schoolId);

  const validRows = rows.filter((r) => !r.error);
  const errorRows = rows.filter((r) => !!r.error);

  const handleFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      setRows(parsed);
      setResults(null);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.name.endsWith(".csv")) handleFile(file);
  };

  const handleImport = async () => {
    setImporting(true);
    let success = 0;
    let failed = 0;

    for (const row of validRows) {
      try {
        await createStudent.mutateAsync({ classId, name: row.name, number: row.number, coverPhotoUrl: row.coverPhotoUrl });
        success++;
      } catch {
        failed++;
      }
    }

    setImporting(false);
    setResults({ success, failed });
    if (failed === 0) {
      setTimeout(() => { onOpenChange(false); setRows([]); setResults(null); }, 1200);
    }
  };

  const reset = () => { setRows([]); setResults(null); };

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) reset(); }} title="Import Students from CSV" className="w-full max-w-2xl sm:max-w-2xl">
        <div className="space-y-4">
          {/* Template download */}
          <div className="flex items-center justify-between rounded-lg border bg-muted/40 px-4 py-3">
            <div>
              <p className="text-sm font-medium">CSV Format</p>
              <p className="text-xs text-muted-foreground">Columns: <code>name</code>, <code>number</code>, <code>photo_url</code> (optional)</p>
            </div>
            <Button variant="outline" size="sm" onClick={downloadTemplate}>
              <Download className="h-3.5 w-3.5" />
              Template
            </Button>
          </div>

          {/* Drop zone */}
          {rows.length === 0 && (
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileRef.current?.click()}
              className="flex cursor-pointer flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border py-12 text-center transition-colors hover:border-primary/40 hover:bg-muted/30"
            >
              <Upload className="h-8 w-8 text-muted-foreground/50" />
              <div>
                <p className="text-sm font-medium">Drop CSV file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">Supports .csv files</p>
              </div>
            </div>
          )}
          <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />

          {/* Preview table */}
          {rows.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{rows.length} rows</Badge>
                  {validRows.length > 0 && <Badge variant="default">{validRows.length} valid</Badge>}
                  {errorRows.length > 0 && <Badge variant="warning">{errorRows.length} errors</Badge>}
                </div>
                <button type="button" onClick={reset} className="text-xs text-muted-foreground hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="max-h-72 overflow-y-auto rounded-xl border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-8">#</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Number</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.map((row, i) => (
                      <TableRow key={i} className={row.error ? "bg-red-50 dark:bg-red-900/10" : ""}>
                        <TableCell className="text-muted-foreground text-xs">{i + 1}</TableCell>
                        <TableCell className="text-sm">{row.name || <span className="text-muted-foreground italic">—</span>}</TableCell>
                        <TableCell className="text-sm tabular-nums">{row.number}</TableCell>
                        <TableCell>
                          {row.error ? (
                            <span className="flex items-center gap-1 text-xs text-destructive">
                              <AlertCircle className="h-3 w-3" />{row.error}
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
                  {results.success} imported successfully{results.failed > 0 ? `, ${results.failed} failed` : ""}
                </div>
              ) : (
                <Button onClick={handleImport} disabled={validRows.length === 0 || importing} className="w-full">
                  {importing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  Import {validRows.length} student{validRows.length !== 1 ? "s" : ""}
                </Button>
              )}
            </div>
          )}
        </div>
    </Sheet>
  );
}
