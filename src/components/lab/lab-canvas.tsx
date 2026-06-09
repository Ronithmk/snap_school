"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { useLabEditorStore, selectActivePage, selectSelectedElement } from "@/stores/lab-editor.store";
import type { LabElement, LabPage, LabPhotoElement, LabShapeElement, LabTextElement } from "@/types";

const CM_TO_PX = 37.795; // 1 cm = 37.795 px at 96 dpi

function cmToPx(cm: number, zoom: number) {
  return cm * CM_TO_PX * zoom;
}

const GRID_CM = 0.5;
const SAFE_MARGIN_CM = 0.5;

function snapToCm(valuePx: number, zoom: number): number {
  const valueCm = valuePx / (CM_TO_PX * zoom);
  return Math.round(valueCm / GRID_CM) * GRID_CM;
}

type DragState = {
  type: "move" | "resize-se" | "resize-sw" | "resize-ne" | "resize-nw" | "rotate";
  startX: number;
  startY: number;
  origX: number;
  origY: number;
  origW: number;
  origH: number;
  origRot: number;
  centerX: number;
  centerY: number;
};

interface LabCanvasProps {
  className?: string;
}

export function LabCanvas({ className }: LabCanvasProps) {
  const page = useLabEditorStore(selectActivePage);
  const selectedElement = useLabEditorStore(selectSelectedElement);
  const { zoom, snapToGrid, showRulers, showMargins, selectElement, updateElement } = useLabEditorStore();

  const canvasRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);
  const [, forceRender] = useState(0);

  const canvasWidthPx = page ? cmToPx(page.widthCm, zoom) : 0;
  const canvasHeightPx = page ? cmToPx(page.heightCm, zoom) : 0;

  const startDrag = useCallback(
    (e: React.PointerEvent, element: LabElement, type: DragState["type"]) => {
      if (element.locked) return;
      e.stopPropagation();
      e.currentTarget.setPointerCapture(e.pointerId);
      const rect = canvasRef.current!.getBoundingClientRect();
      const cx = cmToPx(element.x + element.width / 2, zoom) + rect.left;
      const cy = cmToPx(element.y + element.height / 2, zoom) + rect.top;
      dragRef.current = {
        type,
        startX: e.clientX,
        startY: e.clientY,
        origX: element.x,
        origY: element.y,
        origW: element.width,
        origH: element.height,
        origRot: element.rotation,
        centerX: cx,
        centerY: cy,
      };
      selectElement(element.id);
      forceRender((n) => n + 1);
    },
    [zoom, selectElement],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent) => {
      const drag = dragRef.current;
      if (!drag || !page || !selectedElement) return;
      const dx = (e.clientX - drag.startX) / (CM_TO_PX * zoom);
      const dy = (e.clientY - drag.startY) / (CM_TO_PX * zoom);

      let patch: Partial<LabElement> = {};

      if (drag.type === "move") {
        let nx = drag.origX + dx;
        let ny = drag.origY + dy;
        if (snapToGrid) {
          nx = snapToCm(nx * CM_TO_PX * zoom, zoom);
          ny = snapToCm(ny * CM_TO_PX * zoom, zoom);
        }
        patch = { x: Math.max(0, nx), y: Math.max(0, ny) } as Partial<LabElement>;
      } else if (drag.type === "resize-se") {
        let nw = Math.max(0.5, drag.origW + dx);
        let nh = Math.max(0.5, drag.origH + dy);
        if (snapToGrid) {
          nw = Math.max(0.5, Math.round(nw / GRID_CM) * GRID_CM);
          nh = Math.max(0.5, Math.round(nh / GRID_CM) * GRID_CM);
        }
        patch = { width: nw, height: nh } as Partial<LabElement>;
      } else if (drag.type === "resize-sw") {
        const nw = Math.max(0.5, drag.origW - dx);
        const nh = Math.max(0.5, drag.origH + dy);
        const nx = drag.origX + drag.origW - nw;
        patch = { x: nx, width: nw, height: nh } as Partial<LabElement>;
      } else if (drag.type === "resize-ne") {
        const nw = Math.max(0.5, drag.origW + dx);
        const nh = Math.max(0.5, drag.origH - dy);
        const ny = drag.origY + drag.origH - nh;
        patch = { width: nw, y: ny, height: nh } as Partial<LabElement>;
      } else if (drag.type === "resize-nw") {
        const nw = Math.max(0.5, drag.origW - dx);
        const nh = Math.max(0.5, drag.origH - dy);
        const nx = drag.origX + drag.origW - nw;
        const ny = drag.origY + drag.origH - nh;
        patch = { x: nx, y: ny, width: nw, height: nh } as Partial<LabElement>;
      } else if (drag.type === "rotate") {
        const angle = Math.atan2(e.clientY - drag.centerY, e.clientX - drag.centerX);
        const startAngle = Math.atan2(drag.startY - drag.centerY, drag.startX - drag.centerX);
        let deg = drag.origRot + ((angle - startAngle) * 180) / Math.PI;
        if (snapToGrid) deg = Math.round(deg / 15) * 15;
        patch = { rotation: deg } as Partial<LabElement>;
      }

      updateElement(page.id, selectedElement.id, patch);
    },
    [page, selectedElement, zoom, snapToGrid, updateElement],
  );

  const onPointerUp = useCallback(() => {
    dragRef.current = null;
  }, []);

  if (!page) return null;

  const sortedElements = [...page.elements].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div className={cn("relative flex items-center justify-center overflow-auto bg-muted/40 p-8", className)}>
      {/* Rulers */}
      {showRulers ? <Rulers page={page} zoom={zoom} /> : null}

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="relative shrink-0 shadow-xl"
        style={{
          width: canvasWidthPx,
          height: canvasHeightPx,
          backgroundColor: page.backgroundColor,
          backgroundImage: page.backgroundImageUrl ? `url(${page.backgroundImageUrl})` : undefined,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onClick={() => selectElement(null)}
      >
        {/* Safe margin guides */}
        {showMargins ? (
          <div
            className="pointer-events-none absolute border border-dashed border-blue-400/50"
            style={{
              inset: cmToPx(SAFE_MARGIN_CM, zoom),
            }}
          />
        ) : null}

        {/* Grid overlay */}
        {snapToGrid ? (
          <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-10">
            <defs>
              <pattern id="grid" width={cmToPx(GRID_CM, zoom)} height={cmToPx(GRID_CM, zoom)} patternUnits="userSpaceOnUse">
                <path d={`M ${cmToPx(GRID_CM, zoom)} 0 L 0 0 0 ${cmToPx(GRID_CM, zoom)}`} fill="none" stroke="currentColor" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        ) : null}

        {sortedElements.map((el) => (
          <CanvasElement
            key={el.id}
            element={el}
            zoom={zoom}
            isSelected={selectedElement?.id === el.id}
            onStartDrag={startDrag}
          />
        ))}
      </div>
    </div>
  );
}

interface CanvasElementProps {
  element: LabElement;
  zoom: number;
  isSelected: boolean;
  onStartDrag: (e: React.PointerEvent, el: LabElement, type: DragState["type"]) => void;
}

function CanvasElement({ element, zoom, isSelected, onStartDrag }: CanvasElementProps) {
  const x = cmToPx(element.x, zoom);
  const y = cmToPx(element.y, zoom);
  const w = cmToPx(element.width, zoom);
  const h = cmToPx(element.height, zoom);

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: w,
        height: h,
        transform: `rotate(${element.rotation}deg)`,
        transformOrigin: "center center",
        cursor: element.locked ? "default" : "move",
        outline: isSelected ? "2px solid hsl(var(--primary))" : "none",
        outlineOffset: "1px",
        userSelect: "none",
        zIndex: element.zIndex,
      }}
      onPointerDown={(e) => onStartDrag(e, element, "move")}
    >
      <ElementRenderer element={element} />

      {isSelected && !element.locked ? (
        <>
          {(["nw", "ne", "se", "sw"] as const).map((corner) => (
            <ResizeHandle key={corner} corner={corner} element={element} onStartDrag={onStartDrag} />
          ))}
          <div
            className="absolute left-1/2 -translate-x-1/2 -translate-y-full cursor-grab active:cursor-grabbing"
            style={{ top: -20 }}
            onPointerDown={(e) => onStartDrag(e, element, "rotate")}
          >
            <div className="h-3 w-3 rounded-full border-2 border-primary bg-background shadow" />
          </div>
        </>
      ) : null}

      {element.locked ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded bg-black/30 px-1 py-0.5 text-[8px] text-white">Locked</div>
        </div>
      ) : null}
    </div>
  );
}

function ResizeHandle({
  corner,
  element,
  onStartDrag,
}: {
  corner: "nw" | "ne" | "se" | "sw";
  element: LabElement;
  onStartDrag: (e: React.PointerEvent, el: LabElement, type: DragState["type"]) => void;
}) {
  const posStyle: React.CSSProperties =
    corner === "nw"
      ? { top: -5, left: -5, cursor: "nwse-resize" }
      : corner === "ne"
        ? { top: -5, right: -5, cursor: "nesw-resize" }
        : corner === "se"
          ? { bottom: -5, right: -5, cursor: "nwse-resize" }
          : { bottom: -5, left: -5, cursor: "nesw-resize" };

  return (
    <div
      className="absolute h-2.5 w-2.5 rounded-sm border-2 border-primary bg-background shadow-sm"
      style={{ ...posStyle, position: "absolute" }}
      onPointerDown={(e) => {
        e.stopPropagation();
        onStartDrag(e, element, `resize-${corner}` as DragState["type"]);
      }}
    />
  );
}

function ElementRenderer({ element }: { element: LabElement }) {
  if (element.type === "photo") return <PhotoRenderer el={element} />;
  if (element.type === "text") return <TextRenderer el={element} />;
  return <ShapeRenderer el={element} />;
}

function PhotoRenderer({ el }: { el: LabPhotoElement }) {
  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{ backgroundColor: "#e2e8f0" }}
    >
      {el.placeholderUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={el.placeholderUrl} alt={el.label} className="h-full w-full" style={{ objectFit: el.fit }} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-slate-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
            <circle cx="9" cy="9" r="2" />
            <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
          </svg>
          <span className="text-center text-[10px] leading-tight">{el.label}</span>
        </div>
      )}
    </div>
  );
}

function TextRenderer({ el }: { el: LabTextElement }) {
  const weightMap: Record<string, string> = { normal: "400", medium: "500", bold: "700" };
  return (
    <div
      className="h-full w-full overflow-hidden"
      style={{
        fontFamily: el.fontFamily,
        fontSize: el.fontSize,
        fontWeight: weightMap[el.fontWeight] ?? "400",
        color: el.color,
        textAlign: el.align,
        lineHeight: 1.3,
        padding: 2,
      }}
    >
      {el.text || <span className="opacity-40">Text block</span>}
    </div>
  );
}

function ShapeRenderer({ el }: { el: LabShapeElement }) {
  if (el.shape === "ellipse") {
    return <div className="h-full w-full rounded-full" style={{ backgroundColor: el.fill, border: `2px solid ${el.stroke}` }} />;
  }
  if (el.shape === "line") {
    return <div className="w-full" style={{ height: 2, backgroundColor: el.fill }} />;
  }
  return <div className="h-full w-full" style={{ backgroundColor: el.fill, border: `2px solid ${el.stroke}` }} />;
}

function Rulers({ page, zoom }: { page: LabPage; zoom: number }) {
  const RULER_SIZE = 20;
  const ticks: number[] = [];
  for (let i = 0; i <= page.widthCm; i++) ticks.push(i);
  const vticks: number[] = [];
  for (let i = 0; i <= page.heightCm; i++) vticks.push(i);

  return (
    <>
      {/* Horizontal ruler */}
      <div
        className="pointer-events-none absolute bg-muted/80 border-b border-border text-[9px] text-muted-foreground"
        style={{ top: 0, left: RULER_SIZE, height: RULER_SIZE, width: cmToPx(page.widthCm, zoom) }}
      >
        {ticks.map((tick) => (
          <span
            key={tick}
            className="absolute select-none"
            style={{ left: cmToPx(tick, zoom) - 1, top: 6 }}
          >
            {tick}
          </span>
        ))}
      </div>
      {/* Vertical ruler */}
      <div
        className="pointer-events-none absolute bg-muted/80 border-r border-border text-[9px] text-muted-foreground"
        style={{ top: RULER_SIZE, left: 0, width: RULER_SIZE, height: cmToPx(page.heightCm, zoom) }}
      >
        {vticks.map((tick) => (
          <span
            key={tick}
            className="absolute select-none"
            style={{ top: cmToPx(tick, zoom) - 1, left: 2, writingMode: "vertical-rl" }}
          >
            {tick}
          </span>
        ))}
      </div>
    </>
  );
}
