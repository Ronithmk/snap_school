"use client";

import { GripVertical, Lock, Unlock, Copy, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useLabEditorStore, selectActivePage, selectSelectedElement } from "@/stores/lab-editor.store";
import type { LabElement } from "@/types";

const TYPE_ICONS: Record<LabElement["type"], string> = {
  photo: "🖼",
  text: "T",
  shape: "⬜",
};

export function LabLayersPanel() {
  const page = useLabEditorStore(selectActivePage);
  const selected = useLabEditorStore(selectSelectedElement);
  const { selectElement, removeElement, duplicateElement, toggleElementLock, bringForward, sendBackward } = useLabEditorStore();

  if (!page) return null;

  const sorted = [...page.elements].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="flex flex-col gap-1">
      <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Layers</p>
      {sorted.length === 0 ? (
        <p className="px-2 py-2 text-xs text-muted-foreground">No elements yet.</p>
      ) : (
        sorted.map((el) => (
          <div
            key={el.id}
            className={cn(
              "group flex cursor-pointer items-center gap-1.5 rounded-md px-2 py-1.5 text-sm transition-colors",
              selected?.id === el.id ? "bg-primary/10 text-primary" : "hover:bg-accent",
            )}
            onClick={() => selectElement(el.id)}
          >
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="w-4 shrink-0 text-center text-xs">{TYPE_ICONS[el.type]}</span>
            <span className="min-w-0 flex-1 truncate text-xs">
              {el.type === "photo" ? el.label : el.type === "text" ? el.text || "Text" : el.shape}
            </span>
            <div className="flex shrink-0 items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100">
              <button
                type="button"
                className="rounded p-0.5 hover:bg-muted"
                title={el.locked ? "Unlock" : "Lock"}
                onClick={(e) => { e.stopPropagation(); toggleElementLock(page.id, el.id); }}
              >
                {el.locked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
              </button>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-muted"
                title="Bring forward"
                onClick={(e) => { e.stopPropagation(); bringForward(page.id, el.id); }}
              >
                <ChevronUp className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-muted"
                title="Send backward"
                onClick={(e) => { e.stopPropagation(); sendBackward(page.id, el.id); }}
              >
                <ChevronDown className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="rounded p-0.5 hover:bg-muted"
                title="Duplicate"
                onClick={(e) => { e.stopPropagation(); duplicateElement(page.id, el.id); }}
              >
                <Copy className="h-3 w-3" />
              </button>
              <button
                type="button"
                className="rounded p-0.5 text-destructive hover:bg-muted"
                title="Delete"
                onClick={(e) => { e.stopPropagation(); removeElement(page.id, el.id); }}
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
