"use client";

import { Plus, Trash2, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useLabEditorStore } from "@/stores/lab-editor.store";

let _pageCounter = 1;

export function LabPageStrip() {
  const { pages, activePageId, setActivePage, addPage, removePage, duplicatePage } = useLabEditorStore();
  const activePage = pages.find((p) => p.id === activePageId);

  function handleAddPage() {
    _pageCounter++;
    addPage({
      id: `pg_${Date.now()}`,
      name: `Page ${_pageCounter}`,
      widthCm: activePage?.widthCm ?? 21,
      heightCm: activePage?.heightCm ?? 29.7,
      backgroundColor: "#ffffff",
      elements: [],
    });
  }

  return (
    <div className="flex items-center gap-2 overflow-x-auto border-t border-border bg-background px-4 py-2">
      {pages.map((page, index) => (
        <div
          key={page.id}
          className={cn(
            "group relative flex shrink-0 cursor-pointer flex-col items-center gap-1 rounded-md border p-1 transition-colors",
            page.id === activePageId ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40",
          )}
          onClick={() => setActivePage(page.id)}
        >
          <div
            className="shrink-0 rounded bg-white shadow-sm"
            style={{
              width: 40,
              height: page.heightCm > 0 ? Math.round((40 * page.heightCm) / page.widthCm) : 56,
              backgroundColor: page.backgroundColor,
            }}
          />
          <span className="text-[9px] text-muted-foreground">{index + 1}</span>
          <div className="absolute right-0.5 top-0.5 hidden gap-0.5 group-hover:flex">
            <button
              type="button"
              className="rounded bg-background p-0.5 shadow hover:bg-accent"
              title="Duplicate page"
              onClick={(e) => { e.stopPropagation(); duplicatePage(page.id); }}
            >
              <Copy className="h-2.5 w-2.5" />
            </button>
            {pages.length > 1 ? (
              <button
                type="button"
                className="rounded bg-background p-0.5 shadow hover:bg-accent"
                title="Delete page"
                onClick={(e) => { e.stopPropagation(); removePage(page.id); }}
              >
                <Trash2 className="h-2.5 w-2.5 text-destructive" />
              </button>
            ) : null}
          </div>
        </div>
      ))}
      <button
        type="button"
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-dashed border-muted-foreground/30 text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        onClick={handleAddPage}
        title="Add page"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
