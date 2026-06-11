"use client";

import { use, useRef, useState } from "react";
import Link from "next/link";
import { ChevronRight, ImageIcon, Loader2, MessageCircle, Printer, Sparkles, Users } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { AccessCardTemplate } from "@/components/dashboard/access-card-template";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolClasses, useSchoolAlbums } from "@/hooks/use-albums";
import { useStudents, useEnsureAlbumStudent } from "@/hooks/use-students";
import { routes } from "@/config/routes";
import type { Album, Student } from "@/types";

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

interface Kid {
  album: Album;
  student: Student | null;
}

interface AccessCardsPageProps {
  params: Promise<{ schoolId: string }>;
}

export default function AccessCardsPage({ params }: AccessCardsPageProps) {
  const { schoolId } = use(params);
  const { data: school, isLoading: schoolLoading } = useSchool(schoolId);
  const { data: classes } = useSchoolClasses(schoolId);
  const [classFilter, setClassFilter] = useState<string>("all");
  const { data: albums, isLoading: albumsLoading } = useSchoolAlbums(schoolId, {
    classId: classFilter !== "all" ? classFilter : undefined,
    pageSize: 200,
  });
  const { data: students, isLoading: studentsLoading } = useStudents(schoolId);
  const ensureStudent = useEnsureAlbumStudent(schoolId);

  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [orderClosingDate, setOrderClosingDate] = useState<string>("");
  const [printOptionIdx, setPrintOptionIdx] = useState(0);
  const printRef = useRef<HTMLDivElement>(null);

  const { paperSize, cpp: cardsPerPage } = PRINT_OPTIONS[printOptionIdx];

  const studentMap = new Map((students ?? []).map((s) => [s.id, s]));

  // 1 album = 1 kid: every album becomes a card; the linked Student (if any) supplies access credentials.
  const kids: Kid[] = (albums?.data ?? []).map((album) => ({
    album,
    student: album.studentId ? (studentMap.get(album.studentId) ?? null) : null,
  }));

  const kidsWithCards = kids.filter((k) => k.student);

  const allSelected =
    kidsWithCards.length > 0 && kidsWithCards.every((k) => selected.has(k.album.id));

  function toggleAll() {
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        kidsWithCards.forEach((k) => next.delete(k.album.id));
        return next;
      });
    } else {
      setSelected((prev) => {
        const next = new Set(prev);
        kidsWithCards.forEach((k) => next.add(k.album.id));
        return next;
      });
    }
  }

  function toggleOne(albumId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(albumId)) next.delete(albumId);
      else next.add(albumId);
      return next;
    });
  }

  async function handleGenerate(albumId: string) {
    const result = await ensureStudent.mutateAsync(albumId);
    if (result) setSelected((prev) => new Set(prev).add(albumId));
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

  const selectedKids = kidsWithCards.filter((k) => selected.has(k.album.id));

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  function buildCartUrl(student: Student) {
    if (!school) return origin;
    return `${origin}${routes.storefront.parent(school.slug, student.id)}`;
  }

  function buildGalleryUrl(album: Album) {
    if (!school) return origin;
    return `${origin}${routes.storefront.album(school.slug, album.id)}`;
  }

  const classMap = new Map((classes ?? []).map((c) => [c.id, c]));

  const isLoading = schoolLoading || albumsLoading || studentsLoading;

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
          description="Each album is treated as one kid — generate a printable access card with login credentials and a QR code linking straight to their own gallery."
          actions={
            <div className="flex gap-2">
              {selected.size > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    const lines = selectedKids
                      .map((k) => `• ${k.album.title}: *${k.student!.username}* / ${k.student!.accessCode}\n  Gallery: ${buildGalleryUrl(k.album)}`)
                      .join("\n\n");
                    const msg = `📸 Photo album access credentials:\n\n${lines}`;
                    window.open(`https://wa.me/?text=${encodeURIComponent(msg)}`, "_blank");
                  }}
                >
                  <MessageCircle className="h-4 w-4 text-[#25D366]" />
                  Share via WhatsApp
                </Button>
              )}
              <Button onClick={handlePrint} disabled={selected.size === 0}>
                <Printer className="h-4 w-4" />
                Print {selected.size > 0 ? `${selected.size} card${selected.size !== 1 ? "s" : ""}` : "cards"}
              </Button>
            </div>
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

        {/* ── Kid grid ── */}
        {isLoading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        ) : kids.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No albums found"
            description="Create an album for each kid in this school to generate access cards."
          />
        ) : (
          <>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={toggleAll}
                disabled={kidsWithCards.length === 0}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
              >
                {allSelected ? "Deselect all" : `Select all (${kidsWithCards.length})`}
              </button>
              {selected.size > 0 && (
                <span className="text-sm font-medium text-primary">
                  {selected.size} selected
                </span>
              )}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {kids.map(({ album, student }) => {
                const isSelected = selected.has(album.id);
                const cls = album.classId ? classMap.get(album.classId) : undefined;
                const isGenerating = ensureStudent.isPending && ensureStudent.variables === album.id;

                if (!student) {
                  return (
                    <div
                      key={album.id}
                      className="flex items-center gap-3 rounded-xl border border-dashed border-border bg-card/50 p-3"
                    >
                      <Avatar
                        src={album.coverImageUrl}
                        alt={album.title}
                        fallback={album.title.charAt(0)}
                        className="h-10 w-10 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{album.title}</p>
                        <p className="text-xs text-muted-foreground">
                          {cls ? cls.name : "No class"} · {album.photoCount} photo{album.photoCount === 1 ? "" : "s"}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="shrink-0 gap-1.5 text-xs"
                        disabled={isGenerating}
                        onClick={() => handleGenerate(album.id)}
                      >
                        {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
                        Generate
                      </Button>
                    </div>
                  );
                }

                return (
                  <button
                    key={album.id}
                    type="button"
                    onClick={() => toggleOne(album.id)}
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
                      src={album.coverImageUrl || student.coverPhotoUrl}
                      alt={album.title}
                      fallback={album.title.charAt(0)}
                      className="h-10 w-10 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{album.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {cls ? cls.name : "No class"} · {album.photoCount} photo{album.photoCount === 1 ? "" : "s"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground font-mono">{student.username}</p>
                    </div>
                    {album.coverImageUrl ? (
                      <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : null}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* ── Cards container — always in DOM so we can read innerHTML for the new window ── */}
      <div ref={printRef} className="hidden">
        {school && selectedKids.map(({ album, student }) => (
          <AccessCardTemplate
            key={album.id}
            student={student!}
            school={school}
            schoolClass={album.classId ? classMap.get(album.classId) : undefined}
            galleryUrl={buildGalleryUrl(album)}
            cartUrl={buildCartUrl(student!)}
            orderClosingDate={orderClosingDate}
          />
        ))}
      </div>
    </>
  );
}
