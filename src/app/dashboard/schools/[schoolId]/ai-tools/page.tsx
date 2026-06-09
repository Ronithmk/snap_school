"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  ArrowRight, Bot, Camera, CheckCircle, ChevronRight, Download,
  ImageIcon, Loader2, RefreshCw, Sparkles, Tag, ToggleLeft, ToggleRight, Wand2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useSchool } from "@/hooks/use-tenant";
import { useSchoolAlbums, useSchoolClasses } from "@/hooks/use-albums";
import { routes } from "@/config/routes";

interface Props { params: Promise<{ schoolId: string }> }

// ── AI Tagging section ────────────────────────────────────────────

function AiTaggingCard() {
  const [enabled, setEnabled] = useState(true);
  const [faceDetect, setFaceDetect] = useState(true);
  const [autoTag, setAutoTag] = useState(true);
  const [groupSmile, setGroupSmile] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [done, setDone] = useState(false);

  const runTagging = async () => {
    setIsRunning(true);
    await new Promise((r) => setTimeout(r, 1800));
    setIsRunning(false);
    setDone(true);
    setTimeout(() => setDone(false), 3000);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-500/10 text-violet-600">
              <Tag className="h-4 w-4" />
            </div>
            AI Photo Tagging
          </CardTitle>
          <button type="button" onClick={() => setEnabled((v) => !v)}>
            {enabled ? <ToggleRight className="h-7 w-7 text-primary" /> : <ToggleLeft className="h-7 w-7 text-muted-foreground" />}
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Automatically detect faces, assign photos to students, and tag by class — saving hours of manual work.
        </p>

        {/* Feature toggles */}
        <div className="space-y-2 rounded-lg border p-3">
          {[
            { label: "Face recognition", desc: "Match student photos to their access-card photo", state: faceDetect, set: setFaceDetect },
            { label: "Auto-assign to class", desc: "Tag photos with the detected class based on faces", state: autoTag, set: setAutoTag },
            { label: "Best smile detection", desc: "Mark the highest-smile-score photo in each burst", state: groupSmile, set: setGroupSmile },
          ].map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-3 py-1">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
              <button type="button" onClick={() => item.set((v: boolean) => !v)} disabled={!enabled}>
                {item.state && enabled
                  ? <ToggleRight className="h-6 w-6 text-primary" />
                  : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={runTagging} disabled={isRunning || !enabled}>
            {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {isRunning ? "Running…" : "Re-run tagging now"}
          </Button>
          {done && (
            <span className="flex items-center gap-1.5 text-xs text-green-600">
              <CheckCircle className="h-3.5 w-3.5" />
              Tagging complete
            </span>
          )}
        </div>

        <div className="rounded-lg bg-muted/40 p-3 text-xs text-muted-foreground">
          <p>Last run: <span className="font-medium text-foreground">Today at 09:14 AM</span> — 847 photos tagged, 23 classes, 98.2% accuracy</p>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Memory book wizard ────────────────────────────────────────────

const MEMORY_BOOK_STEPS = [
  { id: "select", label: "Select photos" },
  { id: "layout", label: "Choose layout" },
  { id: "cover", label: "Cover design" },
  { id: "preview", label: "Preview" },
  { id: "export", label: "Export" },
];

function MemoryBookWizard({ schoolId }: { schoolId: string }) {
  const { data: classes } = useSchoolClasses(schoolId);
  const { data: albumsPage } = useSchoolAlbums(schoolId);
  const albums = albumsPage?.data;
  const [step, setStep] = useState(0);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedAlbums, setSelectedAlbums] = useState<string[]>([]);
  const [layout, setLayout] = useState<"grid" | "magazine" | "collage">("grid");
  const [coverTitle, setCoverTitle] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generated, setGenerated] = useState(false);

  const classAlbums = (albums ?? []).filter((a) => !selectedClass || a.classId === selectedClass);

  const toggleAlbum = (id: string) => setSelectedAlbums((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const generate = async () => {
    setIsGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setIsGenerating(false);
    setGenerated(true);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-pink-500/10 text-pink-600">
            <Wand2 className="h-4 w-4" />
          </div>
          Memory Book Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <p className="text-sm text-muted-foreground">
          Automatically compile a downloadable PDF memory book from selected albums — perfect as a year-end keepsake.
        </p>

        {/* Step indicator */}
        <div className="flex items-center gap-1">
          {MEMORY_BOOK_STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-1">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold transition-colors ${i <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {i < step ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
              </div>
              {i < MEMORY_BOOK_STEPS.length - 1 && (
                <div className={`h-px w-6 transition-colors ${i < step ? "bg-primary" : "bg-muted"}`} />
              )}
            </div>
          ))}
          <span className="ml-2 text-xs text-muted-foreground">{MEMORY_BOOK_STEPS[step].label}</span>
        </div>

        {/* Step 0: select photos */}
        {step === 0 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Filter by class (optional)</label>
              <select
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                <option value="">All classes</option>
                {(classes ?? []).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
              {classAlbums.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">No albums found</p>
              ) : classAlbums.map((album) => (
                <label key={album.id} className="flex items-center gap-2 rounded-lg border p-2.5 cursor-pointer hover:bg-muted/30 transition-colors">
                  <input type="checkbox" checked={selectedAlbums.includes(album.id)} onChange={() => toggleAlbum(album.id)} className="rounded" />
                  <ImageIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="text-sm truncate">{album.title}</span>
                  <Badge variant="secondary" className="ml-auto text-xs">{album.photoCount} photos</Badge>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: layout */}
        {step === 1 && (
          <div className="grid grid-cols-3 gap-3">
            {(["grid", "magazine", "collage"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLayout(l)}
                className={`flex flex-col items-center gap-2 rounded-xl border p-3 transition-colors ${layout === l ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-border hover:border-primary/30"}`}
              >
                <div className={`grid gap-0.5 ${l === "grid" ? "grid-cols-2" : l === "magazine" ? "grid-cols-1" : "grid-cols-3"} w-full aspect-[4/3] bg-muted rounded-md overflow-hidden`}>
                  {Array.from({ length: l === "magazine" ? 2 : l === "grid" ? 4 : 6 }).map((_, i) => (
                    <div key={i} className="bg-muted-foreground/20 rounded-[1px]" />
                  ))}
                </div>
                <span className="text-xs font-medium capitalize">{l}</span>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: cover */}
        {step === 2 && (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium" htmlFor="cover-title">Memory book title</label>
              <input
                id="cover-title"
                value={coverTitle}
                onChange={(e) => setCoverTitle(e.target.value)}
                placeholder="Class of 2025 – Riverside Elementary"
                className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
              />
            </div>
            <div className="flex h-32 items-center justify-center rounded-xl border border-dashed bg-muted/30">
              <div className="text-center">
                <Camera className="mx-auto h-6 w-6 text-muted-foreground/40" />
                <p className="text-xs text-muted-foreground mt-1">Cover photo auto-selected from best rated</p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: preview */}
        {step === 3 && (
          <div className="space-y-3">
            <div className="rounded-xl border bg-muted/20 p-4 text-sm space-y-2">
              <p><span className="text-muted-foreground">Albums:</span> {selectedAlbums.length} selected</p>
              <p><span className="text-muted-foreground">Layout:</span> {layout}</p>
              <p><span className="text-muted-foreground">Title:</span> {coverTitle || "(untitled)"}</p>
              <p><span className="text-muted-foreground">Estimated pages:</span> ~{selectedAlbums.length * 8}</p>
            </div>
            <div className="aspect-[3/4] rounded-xl border bg-gradient-to-br from-primary/5 to-primary/20 flex flex-col items-center justify-center gap-2">
              <Wand2 className="h-8 w-8 text-primary/40" />
              <p className="text-xs text-muted-foreground font-medium">PDF preview will render here</p>
            </div>
          </div>
        )}

        {/* Step 4: export */}
        {step === 4 && (
          <div className="space-y-3">
            {!generated ? (
              <Button onClick={generate} disabled={isGenerating} className="w-full">
                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                {isGenerating ? "Generating PDF…" : "Generate memory book"}
              </Button>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2.5 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  <CheckCircle className="h-4 w-4 shrink-0" />
                  Memory book ready!
                </div>
                <Button className="w-full" variant="outline">
                  <Download className="h-4 w-4" />
                  Download PDF
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between">
          <Button variant="outline" size="sm" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>Back</Button>
          {step < MEMORY_BOOK_STEPS.length - 1 ? (
            <Button size="sm" onClick={() => setStep((s) => Math.min(MEMORY_BOOK_STEPS.length - 1, s + 1))}>
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}

// ── Live upload ───────────────────────────────────────────────────

function LiveUploadCard({ schoolId }: { schoolId: string }) {
  const { data: albumsPage } = useSchoolAlbums(schoolId);
  const albums = albumsPage?.data;
  const [liveAlbum, setLiveAlbum] = useState("");
  const [isActive, setIsActive] = useState(false);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <div className={`flex h-7 w-7 items-center justify-center rounded-full ${isActive ? "bg-green-500/10 text-green-600" : "bg-muted text-muted-foreground"}`}>
            <Camera className="h-4 w-4" />
          </div>
          Live Upload Mode
          {isActive && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              Active
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Event-day mode: photos uploaded from the mobile app appear instantly in the selected album. Parents see photos within seconds.
        </p>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Target album</label>
          <select
            className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            value={liveAlbum}
            onChange={(e) => setLiveAlbum(e.target.value)}
          >
            <option value="">— select an album —</option>
            {(albums ?? []).map((a) => <option key={a.id} value={a.id}>{a.title}</option>)}
          </select>
        </div>
        <Button
          variant={isActive ? "outline" : "default"}
          disabled={!liveAlbum}
          onClick={() => setIsActive((v) => !v)}
          className={isActive ? "border-destructive text-destructive hover:bg-destructive/5" : ""}
        >
          {isActive ? "Stop live mode" : (
            <>
              <ArrowRight className="h-4 w-4" />
              Start live upload
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function AiToolsPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">AI & Automation</span>
      </nav>

      <PageHeader
        title="AI & Automation"
        description="Let AI handle tagging and organisation so you can focus on taking great photos."
        actions={
          <div className="flex items-center gap-1.5 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-xs font-medium text-violet-700 dark:bg-violet-900/20 dark:border-violet-700 dark:text-violet-300">
            <Bot className="h-3.5 w-3.5" />
            AI-powered
          </div>
        }
      />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <AiTaggingCard />
        <LiveUploadCard schoolId={schoolId} />
      </div>

      <MemoryBookWizard schoolId={schoolId} />
    </div>
  );
}
