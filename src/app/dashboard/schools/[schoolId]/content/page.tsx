"use client";

import { use, useState } from "react";
import Link from "next/link";
import {
  AlertTriangle, ExternalLink, GripVertical, ImageIcon, Info,
  Loader2, Megaphone, Pencil, Plus, Tag, Trash2, X,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Sheet } from "@/components/ui/sheet";
import {
  useContentBlocks, useCreateContentBlock,
  useUpdateContentBlock, useDeleteContentBlock,
} from "@/hooks/use-content";
import { useSchool } from "@/hooks/use-tenant";
import { routes } from "@/config/routes";
import type {
  AnnouncementStyle, ContentBlock, ContentBlockType,
  CreateContentBlockInput,
} from "@/types";

interface Props { params: Promise<{ schoolId: string }> }

// ── Type metadata ─────────────────────────────────────────────────

const TYPE_META: Record<ContentBlockType, { label: string; description: string; icon: React.ElementType; color: string }> = {
  banner:       { label: "Hero Banner",    description: "Full-width image with title and CTA button",        icon: ImageIcon,     color: "bg-blue-500/10 text-blue-600" },
  announcement: { label: "Announcement",  description: "Colored bar shown at the top of the storefront",    icon: Megaphone,     color: "bg-amber-500/10 text-amber-600" },
  promotion:    { label: "Promotion",     description: "Discount card with offer details and expiry",        icon: Tag,           color: "bg-green-500/10 text-green-600" },
  sponsor:      { label: "Sponsor / Ad",  description: "Sponsor logo with optional link",                   icon: Info,          color: "bg-violet-500/10 text-violet-600" },
};

const ANNOUNCEMENT_STYLES: { value: AnnouncementStyle; label: string; preview: string }[] = [
  { value: "info",    label: "Info (blue)",     preview: "bg-blue-50 text-blue-800 border-blue-200" },
  { value: "success", label: "Success (green)", preview: "bg-green-50 text-green-800 border-green-200" },
  { value: "warning", label: "Warning (amber)", preview: "bg-amber-50 text-amber-800 border-amber-200" },
  { value: "promo",   label: "Promo (violet)",  preview: "bg-violet-50 text-violet-800 border-violet-200" },
];

// ── Block card ────────────────────────────────────────────────────

function BlockCard({
  block, onEdit, onDelete, onToggle, isDeleting, isToggling,
}: {
  block: ContentBlock;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  isDeleting: boolean;
  isToggling: boolean;
}) {
  const meta = TYPE_META[block.type];
  const Icon = meta.icon;

  return (
    <Card className={`transition-opacity ${!block.enabled ? "opacity-50" : ""}`}>
      <CardContent className="flex items-start gap-3 p-4">
        <div className="mt-0.5 cursor-grab text-muted-foreground/40 hover:text-muted-foreground">
          <GripVertical className="h-5 w-5" />
        </div>

        {block.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={block.imageUrl} alt="" className="h-14 w-20 shrink-0 rounded-md object-cover" />
        ) : (
          <div className={`flex h-14 w-20 shrink-0 items-center justify-center rounded-md ${meta.color}`}>
            <Icon className="h-6 w-6" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-xs">{meta.label}</Badge>
            {block.endsAt && new Date(block.endsAt) < new Date() && (
              <Badge variant="warning" className="text-xs">Expired</Badge>
            )}
            {!block.enabled && <Badge variant="neutral" className="text-xs">Disabled</Badge>}
          </div>
          <p className="mt-1 font-medium text-sm leading-snug">{block.title ?? block.body ?? "(no title)"}</p>
          {block.subtitle && <p className="text-xs text-muted-foreground truncate">{block.subtitle}</p>}
          {block.endsAt && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Ends {new Date(block.endsAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={onToggle}
            disabled={isToggling}
            title={block.enabled ? "Disable" : "Enable"}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors focus-visible:outline-none ${
              block.enabled ? "bg-primary" : "bg-muted"
            }`}
          >
            <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition-transform ${block.enabled ? "translate-x-4" : "translate-x-0"}`} />
          </button>
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={onDelete} disabled={isDeleting}>
            {isDeleting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Block form sheet ──────────────────────────────────────────────

const EMPTY_FORM: CreateContentBlockInput = {
  type: "banner", title: "", subtitle: "", body: "",
  imageUrl: "", ctaLabel: "", ctaUrl: "",
  announcementStyle: "info", enabled: true,
};

function BlockFormSheet({
  schoolId, open, onOpenChange, editing,
}: {
  schoolId: string;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: ContentBlock | null;
}) {
  const create = useCreateContentBlock(schoolId);
  const update = useUpdateContentBlock(schoolId);
  const [form, setForm] = useState<CreateContentBlockInput>(editing ? {
    type: editing.type,
    title: editing.title ?? "",
    subtitle: editing.subtitle ?? "",
    body: editing.body ?? "",
    imageUrl: editing.imageUrl ?? "",
    ctaLabel: editing.ctaLabel ?? "",
    ctaUrl: editing.ctaUrl ?? "",
    announcementStyle: editing.announcementStyle ?? "info",
    enabled: editing.enabled,
    startsAt: editing.startsAt,
    endsAt: editing.endsAt,
  } : EMPTY_FORM);

  const set = <K extends keyof CreateContentBlockInput>(k: K, v: CreateContentBlockInput[K]) =>
    setForm((p) => ({ ...p, [k]: v }));

  const handleSubmit = async () => {
    const payload = {
      ...form,
      title: form.title || undefined,
      subtitle: form.subtitle || undefined,
      body: form.body || undefined,
      imageUrl: form.imageUrl || undefined,
      ctaLabel: form.ctaLabel || undefined,
      ctaUrl: form.ctaUrl || undefined,
    };
    if (editing) {
      await update.mutateAsync({ id: editing.id, input: payload });
    } else {
      await create.mutateAsync(payload);
    }
    onOpenChange(false);
  };

  const isPending = create.isPending || update.isPending;
  const showImage = form.type === "banner" || form.type === "sponsor" || form.type === "promotion";
  const showCta = form.type === "banner" || form.type === "promotion";
  const showBody = form.type === "announcement" || form.type === "promotion";
  const showAnnStyle = form.type === "announcement" || form.type === "promotion";

  return (
    <Sheet
      open={open}
      onOpenChange={(v) => { onOpenChange(v); if (!v) setForm(EMPTY_FORM); }}
      title={editing ? "Edit content block" : "Add content block"}
      description="This block will appear on your school's public storefront."
    >
      <div className="space-y-4">
        {/* Type */}
        <div className="space-y-1.5">
          <Label>Block type</Label>
          <div className="grid grid-cols-2 gap-2">
            {(Object.entries(TYPE_META) as [ContentBlockType, typeof TYPE_META[ContentBlockType]][]).map(([type, meta]) => {
              const Icon = meta.icon;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => set("type", type)}
                  className={`flex items-center gap-2 rounded-lg border p-3 text-left text-sm transition-colors ${
                    form.type === type
                      ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <div className={`rounded-md p-1.5 ${meta.color}`}><Icon className="h-4 w-4" /></div>
                  <span className="font-medium">{meta.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <Label htmlFor="cb-title">Title</Label>
          <Input id="cb-title" value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. School Photos Are Ready!" />
        </div>

        {/* Subtitle */}
        {(form.type === "banner" || form.type === "promotion") && (
          <div className="space-y-1.5">
            <Label htmlFor="cb-subtitle">Subtitle</Label>
            <Input id="cb-subtitle" value={form.subtitle} onChange={(e) => set("subtitle", e.target.value)} placeholder="Supporting text below the title" />
          </div>
        )}

        {/* Body */}
        {showBody && (
          <div className="space-y-1.5">
            <Label htmlFor="cb-body">Message</Label>
            <textarea
              id="cb-body"
              value={form.body}
              onChange={(e) => set("body", e.target.value)}
              rows={2}
              placeholder="Announcement or promotion details…"
              className="w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring placeholder:text-muted-foreground"
            />
          </div>
        )}

        {/* Image URL */}
        {showImage && (
          <div className="space-y-1.5">
            <Label htmlFor="cb-image">Image URL</Label>
            <Input id="cb-image" value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" />
            {form.imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.imageUrl} alt="" className="mt-1 h-28 w-full rounded-md object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
            )}
          </div>
        )}

        {/* CTA */}
        {showCta && (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="cb-cta-label">Button label</Label>
              <Input id="cb-cta-label" value={form.ctaLabel} onChange={(e) => set("ctaLabel", e.target.value)} placeholder="View Albums" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="cb-cta-url">Button link</Label>
              <Input id="cb-cta-url" value={form.ctaUrl} onChange={(e) => set("ctaUrl", e.target.value)} placeholder="#albums or https://…" />
            </div>
          </div>
        )}

        {/* Announcement style */}
        {showAnnStyle && (
          <div className="space-y-1.5">
            <Label>Colour style</Label>
            <div className="flex flex-wrap gap-2">
              {ANNOUNCEMENT_STYLES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set("announcementStyle", s.value)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-all ${s.preview} ${form.announcementStyle === s.value ? "ring-2 ring-primary ring-offset-1" : ""}`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Date range */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="cb-start">Start date (optional)</Label>
            <input type="date" id="cb-start" value={form.startsAt?.slice(0, 10) ?? ""} onChange={(e) => set("startsAt", e.target.value ? `${e.target.value}T00:00:00.000Z` : undefined)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cb-end">End date (optional)</Label>
            <input type="date" id="cb-end" value={form.endsAt?.slice(0, 10) ?? ""} onChange={(e) => set("endsAt", e.target.value ? `${e.target.value}T23:59:59.000Z` : undefined)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" />
          </div>
        </div>

        <Button onClick={handleSubmit} disabled={isPending} className="w-full">
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {editing ? "Save changes" : "Add block"}
        </Button>
      </div>
    </Sheet>
  );
}

// ── Page ──────────────────────────────────────────────────────────

export default function SchoolContentPage({ params }: Props) {
  const { schoolId } = use(params);
  const { data: school } = useSchool(schoolId);
  const { data: blocks, isLoading } = useContentBlocks(schoolId);
  const deleteBlock = useDeleteContentBlock(schoolId);
  const updateBlock = useUpdateContentBlock(schoolId);

  const [sheetOpen, setSheetOpen] = useState(false);
  const [editing, setEditing] = useState<ContentBlock | null>(null);
  const [activeTab, setActiveTab] = useState<ContentBlockType | "all">("all");

  const filtered = (blocks ?? []).filter((b) => activeTab === "all" || b.type === activeTab);

  const openEdit = (block: ContentBlock) => { setEditing(block); setSheetOpen(true); };
  const openCreate = () => { setEditing(null); setSheetOpen(true); };

  const storefrontUrl = school ? routes.storefront.school(school.slug) : "#";

  return (
    <div className="space-y-6">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href={routes.dashboard.schools()} className="hover:text-foreground transition-colors">Schools</Link>
        <span>/</span>
        <Link href={routes.dashboard.school(schoolId)} className="hover:text-foreground transition-colors truncate">{school?.name ?? schoolId}</Link>
        <span>/</span>
        <span className="text-foreground">Content / CMS</span>
      </nav>

      <PageHeader
        title="Content Manager"
        description="Add banners, announcements, and promotions that appear on your school's public storefront — no coding needed."
        actions={
          <div className="flex gap-2">
            <Link href={storefrontUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-md border border-input bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent">
              <ExternalLink className="h-4 w-4" />
              Preview storefront
            </Link>
            <Button onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Add content
            </Button>
          </div>
        }
      />

      {/* Type filter tabs */}
      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1">
        {(["all", "banner", "announcement", "promotion", "sponsor"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors capitalize ${
              activeTab === tab ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {tab === "all" ? "All" : TYPE_META[tab].label}
            {tab !== "all" && (
              <span className="ml-1 text-muted-foreground">
                ({(blocks ?? []).filter((b) => b.type === tab).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Info box */}
      <div className="flex items-start gap-2 rounded-lg border bg-blue-50 px-4 py-3 dark:bg-blue-900/10">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-blue-600 dark:text-blue-400" />
        <p className="text-xs text-blue-700 dark:text-blue-300">
          Blocks are shown on your storefront in priority order. Drag to reorder. Disabled blocks are hidden from parents.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-xl border border-dashed py-16 text-center">
          <div className="rounded-full bg-muted p-4"><Megaphone className="h-8 w-8 text-muted-foreground/40" /></div>
          <div>
            <p className="font-medium">No content blocks yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add a banner or announcement to engage parents on your storefront.</p>
          </div>
          <Button onClick={openCreate}><Plus className="h-4 w-4" />Add content block</Button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((block) => (
            <BlockCard
              key={block.id}
              block={block}
              onEdit={() => openEdit(block)}
              onDelete={() => deleteBlock.mutate(block.id)}
              onToggle={() => updateBlock.mutate({ id: block.id, input: { enabled: !block.enabled } })}
              isDeleting={deleteBlock.isPending && deleteBlock.variables === block.id}
              isToggling={updateBlock.isPending && updateBlock.variables?.id === block.id}
            />
          ))}
        </div>
      )}

      <BlockFormSheet
        schoolId={schoolId}
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        editing={editing}
      />
    </div>
  );
}
