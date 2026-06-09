"use client";

import { use, useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import {
  ArrowLeft,
  ChevronDown,
  Download,
  Grid3X3,
  ImagePlus,
  Loader2,
  Maximize2,
  Minimize2,
  Minus,
  Plus,
  Ruler,
  Save,
  Shapes,
  Type,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LabCanvas, LabLayersPanel, LabPropertiesPanel, LabPageStrip } from "@/components/lab";
import { useLabEditorStore, selectActivePage } from "@/stores/lab-editor.store";
import { useLabStore } from "@/stores/lab.store";
import { useLabProduct, useUpdateLabProduct, useExportLabProduct } from "@/hooks/use-lab";
import { LAB_PRODUCT_STATUS_LABELS, LAB_PRODUCT_STATUS_TONES } from "@/config/constants";
import { routes } from "@/config/routes";
import type { ApiError, LabElement, LabExportFormat, LabProductStatus } from "@/types";

interface EditorPageProps {
  params: Promise<{ id: string }>;
}

export default function LabEditorPage({ params }: EditorPageProps) {
  const { id: productId } = use(params);
  const router = useRouter();

  const { activeSchoolId } = useLabStore();
  const { data: product, isLoading } = useLabProduct(productId);
  const updateProduct = useUpdateLabProduct(activeSchoolId ?? undefined);
  const exportProduct = useExportLabProduct();

  const editorStore = useLabEditorStore();
  const activePage = useLabEditorStore(selectActivePage);
  const { load, markSaved, setZoom, toggleSnapToGrid, toggleRulers, toggleMargins, addElement, isDirty, zoom, snapToGrid, showRulers, showMargins } = editorStore;

  const [panel, setPanel] = useState<"layers" | "properties">("layers");
  const [autosaveTimer, setAutosaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);

  // Load product into editor store on mount
  useEffect(() => {
    if (product) load(product.id, product.pages);
  }, [product, load]);

  // Debounced autosave
  useEffect(() => {
    if (!isDirty || !product) return;
    if (autosaveTimer) clearTimeout(autosaveTimer);
    const timer = setTimeout(() => handleSave(true), 3000);
    setAutosaveTimer(timer);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDirty, editorStore.pages]);

  const handleSave = useCallback(
    async (silent = false) => {
      if (!product) return;
      setIsSaving(true);
      try {
        await updateProduct.mutateAsync({
          id: product.id,
          input: { pages: editorStore.pages },
        });
        markSaved();
        if (!silent) toast.success("Layout saved.");
      } catch (err) {
        if (!silent) toast.error((err as ApiError).message ?? "Couldn't save.");
      } finally {
        setIsSaving(false);
      }
    },
    [product, updateProduct, editorStore.pages, markSaved],
  );

  async function handlePublish() {
    if (!product) return;
    try {
      await updateProduct.mutateAsync({ id: product.id, input: { status: "published" } });
      toast.success("Product published.");
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't publish.");
    }
  }

  async function handleExport(format: LabExportFormat) {
    setExportMenuOpen(false);
    try {
      const { url } = await exportProduct.mutateAsync({ productId, format });
      window.open(url, "_blank");
      toast.success(`Export ready (${format.toUpperCase()}).`);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Export failed.");
    }
  }

  function addPhotoElement() {
    if (!activePage) return;
    addElement(activePage.id, {
      id: `el_${Date.now()}`,
      type: "photo",
      label: "Photo",
      x: 1,
      y: 1,
      width: 6,
      height: 8,
      rotation: 0,
      zIndex: 10,
      locked: false,
      fit: "cover",
    });
  }

  function addTextElement() {
    if (!activePage) return;
    addElement(activePage.id, {
      id: `el_${Date.now()}`,
      type: "text",
      text: "Text block",
      x: 1,
      y: 1,
      width: 8,
      height: 1.5,
      rotation: 0,
      zIndex: 10,
      locked: false,
      fontFamily: "Inter",
      fontSize: 16,
      fontWeight: "normal",
      color: "#1f2937",
      align: "center",
    });
  }

  function addShapeElement() {
    if (!activePage) return;
    addElement(activePage.id, {
      id: `el_${Date.now()}`,
      type: "shape",
      shape: "rectangle",
      x: 1,
      y: 1,
      width: 5,
      height: 5,
      rotation: 0,
      zIndex: 10,
      locked: false,
      fill: "#e2e8f0",
      stroke: "#94a3b8",
    });
  }

  if (isLoading || !product) {
    return (
      <div className="flex h-screen flex-col">
        <div className="flex h-14 items-center gap-3 border-b border-border px-4">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-6 w-24" />
        </div>
        <div className="flex flex-1 overflow-hidden">
          <Skeleton className="h-full w-56 border-r border-border" />
          <Skeleton className="flex-1" />
          <Skeleton className="h-full w-56 border-l border-border" />
        </div>
      </div>
    );
  }

  const status = product.status as LabProductStatus;

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col overflow-hidden">
      {/* Toolbar */}
      <div className="flex shrink-0 items-center gap-2 border-b border-border bg-background px-3 py-2">
        <Link href={routes.dashboard.labProducts()} className="mr-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
        </Link>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold">{product.name}</p>
          <p className="text-[10px] text-muted-foreground">{product.dimensions.label} · {product.pages.length} page{product.pages.length !== 1 ? "s" : ""}</p>
        </div>

        <Badge variant={LAB_PRODUCT_STATUS_TONES[status]} className="shrink-0 text-[10px]">
          {LAB_PRODUCT_STATUS_LABELS[status]}
        </Badge>

        {/* Insert buttons */}
        <div className="hidden items-center gap-1 sm:flex">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addPhotoElement} title="Add photo placeholder">
            <ImagePlus className="h-3.5 w-3.5" />
            Photo
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addTextElement} title="Add text block">
            <Type className="h-3.5 w-3.5" />
            Text
          </Button>
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addShapeElement} title="Add shape">
            <Shapes className="h-3.5 w-3.5" />
            Shape
          </Button>
        </div>

        {/* Zoom controls */}
        <div className="flex items-center rounded-md border border-border">
          <button type="button" className="px-2 py-1 hover:bg-accent" onClick={() => setZoom(zoom - 0.1)}>
            <ZoomOut className="h-3.5 w-3.5" />
          </button>
          <span className="select-none px-2 text-xs tabular-nums">{Math.round(zoom * 100)}%</span>
          <button type="button" className="px-2 py-1 hover:bg-accent" onClick={() => setZoom(zoom + 0.1)}>
            <ZoomIn className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* View toggles */}
        <button
          type="button"
          title="Toggle snap to grid"
          onClick={toggleSnapToGrid}
          className={`rounded p-1.5 transition-colors ${snapToGrid ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}
        >
          <Grid3X3 className="h-4 w-4" />
        </button>
        <button
          type="button"
          title="Toggle rulers"
          onClick={toggleRulers}
          className={`rounded p-1.5 transition-colors ${showRulers ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}
        >
          <Ruler className="h-4 w-4" />
        </button>

        {/* Save / publish */}
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => handleSave(false)} disabled={isSaving || !isDirty}>
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
          {isSaving ? "Saving…" : isDirty ? "Save" : "Saved"}
        </Button>

        {status !== "published" ? (
          <Button size="sm" className="h-8 text-xs" onClick={handlePublish} disabled={updateProduct.isPending}>
            Publish
          </Button>
        ) : null}

        {/* Export menu */}
        <div className="relative">
          <Button variant="outline" size="sm" className="h-8 text-xs" onClick={() => setExportMenuOpen((o) => !o)} disabled={exportProduct.isPending}>
            {exportProduct.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
            Export
            <ChevronDown className="h-3 w-3" />
          </Button>
          {exportMenuOpen ? (
            <div className="absolute right-0 top-full z-50 mt-1 w-32 overflow-hidden rounded-md border border-border bg-background shadow-lg">
              {(["jpg", "pdf", "zip"] as LabExportFormat[]).map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className="w-full px-3 py-2 text-left text-xs hover:bg-accent"
                  onClick={() => handleExport(fmt)}
                >
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {/* Body */}
      <div className="flex min-h-0 flex-1">
        {/* Left panel: layers */}
        <aside className="hidden w-52 shrink-0 overflow-y-auto border-r border-border bg-background p-2 sm:block">
          <LabLayersPanel />
        </aside>

        {/* Canvas area */}
        <main className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <LabCanvas className="flex-1" />
          <LabPageStrip />
        </main>

        {/* Right panel: properties */}
        <aside className="hidden w-56 shrink-0 overflow-y-auto border-l border-border bg-background sm:block">
          <Tabs value={panel} onValueChange={(v) => setPanel(v as "layers" | "properties")}>
            <TabsList className="m-2 w-[calc(100%-1rem)]">
              <TabsTrigger value="layers" className="flex-1 text-xs">Layers</TabsTrigger>
              <TabsTrigger value="properties" className="flex-1 text-xs">Properties</TabsTrigger>
            </TabsList>
            <TabsContent value="layers">
              <LabLayersPanel />
            </TabsContent>
            <TabsContent value="properties">
              <LabPropertiesPanel />
            </TabsContent>
          </Tabs>
        </aside>
      </div>
    </div>
  );
}
