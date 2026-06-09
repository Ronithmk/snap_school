"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, Printer, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessCardTemplate } from "@/components/dashboard/access-card-template";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolClasses, useSchoolAlbums } from "@/hooks/use-albums";
import { useStudents } from "@/hooks/use-students";
import { routes } from "@/config/routes";
import type { Student } from "@/types";

type PaperSize = "A5" | "A4" | "A3";
type CardsPerPage = 1 | 2 | 4;

interface PrintOption {
  paperSize: PaperSize;
  cpp: CardsPerPage;
  label: string;
  hint: string;
}

const PRINT_OPTIONS: PrintOption[] = [
  { paperSize: "A5", cpp: 1, label: "A5 · 1/page",  hint: "Portrait — 1 full-size card" },
  { paperSize: "A4", cpp: 1, label: "A4 · 1/page",  hint: "Portrait — 1 card centered on A4" },
  { paperSize: "A4", cpp: 2, label: "A4 · 2/page",  hint: "Landscape — 2 cards side by side (cut in half)" },
  { paperSize: "A3", cpp: 2, label: "A3 · 2/page",  hint: "Portrait — 2 full-size cards side by side" },
  { paperSize: "A3", cpp: 4, label: "A3 · 4/page",  hint: "Portrait — 4 cards in a 2×2 grid" },
];

const CARD_W = 148; // mm
const CARD_H = 210; // mm

function getPrintLayout(paperSize: PaperSize, cpp: CardsPerPage) {
  const margin = 6;
  const gap = 4;
  const baseDims: Record<PaperSize, [number, number]> = {
    A5: [148, 210],
    A4: [210, 297],
    A3: [297, 420],
  };
  let [pW, pH] = baseDims[paperSize];
  let cols = 1, rows = 1, orientation = "portrait";

  if (cpp === 2) {
    if (paperSize === "A4") { [pW, pH] = [pH, pW]; orientation = "landscape"; }
    cols = 2;
  } else if (cpp === 4) {
    cols = 2; rows = 2;
  }

  const availW = pW - margin * 2;
  const availH = pH - margin * 2;
  const cellW = (availW - (cols - 1) * gap) / cols;
  const cellH = (availH - (rows - 1) * gap) / rows;
  const scale = Math.min(1, cellW / CARD_W, cellH / CARD_H);

  return { pW, pH, cols, rows, orientation, cellW, cellH, scale, margin, gap };
}

interface AccessCardsPageProps {
  params: Promise<{ schoolId: string }>;
}

export default function AccessCardsPage({ params }: AccessCardsPageProps) {
  const { schoolId } = use(params);
  const { data: school, isLoading: schoolLoading } = useSchool(schoolId);
  const { data: classes } = useSchoolClasses(schoolId);
  const { data: albums } = useSchoolAlbums(schoolId);
  const [classFilter, setClassFilter] = useState<string>("all");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [orderClosingDate, setOrderClosingDate] = useState<string>("");
  const [selectedAlbumId, setSelectedAlbumId] = useState<string>("");
  const [printOptionIdx, setPrintOptionIdx] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  const { paperSize, cpp: cardsPerPage } = PRINT_OPTIONS[printOptionIdx];

  const { data: students, isLoading: studentsLoading } = useStudents(
    schoolId,
    classFilter !== "all" ? classFilter : undefined
  );

  const filteredStudents = students ?? [];

  const allSelected =
    filteredStudents.length > 0 && filteredStudents.every((s) => selected.has(s.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.delete(s.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        filteredStudents.forEach((s) => next.add(s.id));
        return next;
      });
    }
  }

  function toggleOne(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handlePrint() {
    const container = printRef.current;
    if (!container) return;

    const cardEls = Array.from(container.children);
    if (cardEls.length === 0) return;

    const win = window.open("", "_blank");
    if (!win) {
      alert("Pop-up blocked. Please allow pop-ups for this site and try again.");
      return;
    }

    const layout = getPrintLayout(paperSize, cardsPerPage);
    const { pW, pH, cellW, cellH, scale, margin, gap } = layout;
    const pageAvailW = pW - margin * 2;

    // Group cards into pages of `cardsPerPage`
    const pages: Element[][] = [];
    for (let i = 0; i < cardEls.length; i += cardsPerPage) {
      pages.push(cardEls.slice(i, i + cardsPerPage));
    }

    const bodyHTML = pages.map((page) => {
      const cells = page.map((card) =>
        `<div style="width:${cellW.toFixed(2)}mm;height:${cellH.toFixed(2)}mm;overflow:hidden;flex-shrink:0;">` +
        `<div style="transform:scale(${scale.toFixed(4)});transform-origin:top left;">` +
        card.outerHTML +
        `</div></div>`
      ).join("");
      return (
        `<div style="display:flex;flex-wrap:wrap;width:${pageAvailW.toFixed(2)}mm;` +
        `gap:${gap}mm;page-break-after:always;break-after:page;">` +
        cells +
        `</div>`
      );
    }).join("");

    win.document.write(
      `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Access Cards</title>` +
      `<style>* { box-sizing: border-box; margin: 0; padding: 0; }` +
      `body { background: #fff; font-family: Arial, Helvetica, sans-serif; }` +
      `@page { size: ${pW}mm ${pH}mm; margin: ${margin}mm; }` +
      `@media print { * { -webkit-print-color-adjust: exact; print-color-adjust: exact; }` +
      `.access-card-page { border: none !important; } }` +
      `</style></head><body>${bodyHTML}</body></html>`
    );
    win.document.close();

    const images = Array.from(win.document.querySelectorAll("img"));
    if (images.length === 0) { win.focus(); win.print(); win.close(); return; }
    let remaining = images.length;
    function tryPrint() {
      remaining -= 1;
      if (remaining === 0) { win!.focus(); win!.print(); win!.close(); }
    }
    images.forEach((img) => {
      if (img.complete) tryPrint(); else { img.onload = tryPrint; img.onerror = tryPrint; }
    });
  }

  const selectedStudents = filteredStudents.filter((s) => selected.has(s.id));

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const activeAlbum = albums?.data.find((a) => a.id === selectedAlbumId) ?? albums?.data[0];

  function buildCartUrl(student: Student) {
    if (!activeAlbum || !school) return origin;
    return `${origin}${routes.storefront.cart(school.slug, activeAlbum.id)}?student=${student.id}`;
  }

  function buildGalleryUrl() {
    if (!activeAlbum || !school) return origin;
    return `${origin}${routes.storefront.album(school.slug, activeAlbum.id)}`;
  }

  const classMap = new Map((classes ?? []).map((c) => [c.id, c]));

  const isLoading = schoolLoading || studentsLoading;

  return (
    <>
      {/* ── Screen UI ── */}
      <div className="print:hidden space-y-6">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href={routes.dashboard.schools()} className="transition-colors hover:text-foreground">
            Schools
          </Link>
          <ChevronRight className="h-3.5 w-3.5" />
          {school ? (
            <Link
              href={routes.dashboard.school(schoolId)}
              className="transition-colors hover:text-foreground truncate"
            >
              {school.name}
            </Link>
          ) : (
            <Skeleton className="h-4 w-24" />
          )}
          <ChevronRight className="h-3.5 w-3.5" />
          <span className="text-foreground">Access Cards</span>
        </nav>

        <PageHeader
          title="Access Cards"
          description="Generate printable access cards with login credentials and QR codes for students."
          actions={
            <Button
              onClick={handlePrint}
              disabled={selected.size === 0}
            >
              <Printer className="h-4 w-4" />
              Print {selected.size > 0 ? `${selected.size} card${selected.size !== 1 ? "s" : ""}` : "cards"}
            </Button>
          }
        />

        {/* ── Filters & settings ── */}
        <div className="flex flex-wrap gap-3 rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Class
            </label>
            <Select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              containerClassName="w-44"
            >
              <option value="all">All classes</option>
              {(classes ?? []).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Album (for cart link)
            </label>
            <Select
              value={selectedAlbumId || albums?.data[0]?.id || ""}
              onChange={(e) => setSelectedAlbumId(e.target.value)}
              containerClassName="w-56"
            >
              {(albums?.data ?? []).map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </Select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Order closing date
            </label>
            <input
              type="date"
              value={orderClosingDate}
              onChange={(e) => setOrderClosingDate(e.target.value)}
              className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Print layout
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRINT_OPTIONS.map((opt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setPrintOptionIdx(i)}
                  className={`rounded-md border px-2.5 py-1 text-xs font-medium transition-colors ${
                    printOptionIdx === i
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">{PRINT_OPTIONS[printOptionIdx].hint}</p>
          </div>
        </div>

        {/* ── Student grid ── */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : filteredStudents.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No students found"
            description="Add students to this school to generate access cards."
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleAll}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {allSelected ? "Deselect all" : `Select all (${filteredStudents.length})`}
              </button>
              {selected.size > 0 && (
                <span className="text-sm font-medium text-primary">
                  {selected.size} selected
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredStudents.map((student) => {
                const isSelected = selected.has(student.id);
                const cls = classMap.get(student.classId);
                return (
                  <button
                    key={student.id}
                    type="button"
                    onClick={() => toggleOne(student.id)}
                    className={`flex items-center gap-3 rounded-xl border p-3 text-left transition-colors ${
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border bg-card hover:border-primary/40 hover:bg-accent/50"
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors ${
                        isSelected ? "border-primary bg-primary" : "border-border bg-background"
                      }`}
                    >
                      {isSelected && (
                        <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <Avatar
                      src={student.coverPhotoUrl}
                      alt={student.name}
                      fallback={student.name.charAt(0)}
                      className="h-10 w-10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{student.name}</p>
                      <p className="text-xs text-muted-foreground">
                        #{student.number}
                        {cls ? ` · ${cls.name}` : ""}
                      </p>
                      <p className="truncate text-xs text-muted-foreground font-mono">{student.username}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Cards container — always in DOM so we can read innerHTML for the new window ── */}
      <div ref={printRef} className="hidden">
        {school && selectedStudents.map((student) => (
          <AccessCardTemplate
            key={student.id}
            student={student}
            school={school}
            schoolClass={classMap.get(student.classId)}
            galleryUrl={buildGalleryUrl()}
            cartUrl={buildCartUrl(student)}
            orderClosingDate={orderClosingDate}
          />
        ))}
      </div>
    </>
  );
}
