"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { useLabEditorStore, selectActivePage, selectSelectedElement } from "@/stores/lab-editor.store";
import type { LabElement, LabPhotoElement, LabShapeElement, LabTextElement } from "@/types";

export function LabPropertiesPanel() {
  const page = useLabEditorStore(selectActivePage);
  const element = useLabEditorStore(selectSelectedElement);
  const { updateElement, setPageBackground } = useLabEditorStore();

  if (!page) return null;

  if (!element) {
    return (
      <div className="flex flex-col gap-3 p-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Page</p>
        <FieldRow label="Background">
          <Input type="color" value={page.backgroundColor} className="h-8 w-full cursor-pointer p-1"
            onChange={(e) => setPageBackground(page.id, { backgroundColor: e.target.value })} />
        </FieldRow>
      </div>
    );
  }

  function patch(p: Partial<LabElement>) {
    updateElement(page!.id, element!.id, p);
  }

  return (
    <div className="flex flex-col gap-3 p-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Properties</p>

      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="X (cm)">
          <NumberInput value={element.x} step={0.5} onChange={(v) => patch({ x: v } as Partial<LabElement>)} />
        </FieldRow>
        <FieldRow label="Y (cm)">
          <NumberInput value={element.y} step={0.5} onChange={(v) => patch({ y: v } as Partial<LabElement>)} />
        </FieldRow>
        <FieldRow label="W (cm)">
          <NumberInput value={element.width} step={0.5} min={0.5} onChange={(v) => patch({ width: v } as Partial<LabElement>)} />
        </FieldRow>
        <FieldRow label="H (cm)">
          <NumberInput value={element.height} step={0.5} min={0.5} onChange={(v) => patch({ height: v } as Partial<LabElement>)} />
        </FieldRow>
        <FieldRow label="Rotate °">
          <NumberInput value={element.rotation} step={1} onChange={(v) => patch({ rotation: v } as Partial<LabElement>)} />
        </FieldRow>
      </div>

      {element.type === "photo" ? <PhotoProps el={element} patch={patch as (p: Partial<LabPhotoElement>) => void} /> : null}
      {element.type === "text" ? <TextProps el={element} patch={patch as (p: Partial<LabTextElement>) => void} /> : null}
      {element.type === "shape" ? <ShapeProps el={element} patch={patch as (p: Partial<LabShapeElement>) => void} /> : null}
    </div>
  );
}

function PhotoProps({ el, patch }: { el: LabPhotoElement; patch: (p: Partial<LabPhotoElement>) => void }) {
  return (
    <>
      <FieldRow label="Label">
        <Input value={el.label} className="h-7 text-xs" onChange={(e) => patch({ label: e.target.value })} />
      </FieldRow>
      <FieldRow label="Fit">
        <Select value={el.fit} onChange={(e) => patch({ fit: e.target.value as "cover" | "contain" })} containerClassName="w-full">
          <option value="cover">Cover</option>
          <option value="contain">Contain</option>
        </Select>
      </FieldRow>
    </>
  );
}

function TextProps({ el, patch }: { el: LabTextElement; patch: (p: Partial<LabTextElement>) => void }) {
  return (
    <>
      <FieldRow label="Text">
        <Input value={el.text} className="h-7 text-xs" onChange={(e) => patch({ text: e.target.value })} />
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Font size">
          <NumberInput value={el.fontSize} step={1} min={6} onChange={(v) => patch({ fontSize: v })} />
        </FieldRow>
        <FieldRow label="Colour">
          <Input type="color" value={el.color} className="h-7 w-full cursor-pointer p-0.5" onChange={(e) => patch({ color: e.target.value })} />
        </FieldRow>
        <FieldRow label="Weight">
          <Select value={el.fontWeight} onChange={(e) => patch({ fontWeight: e.target.value as LabTextElement["fontWeight"] })} containerClassName="w-full">
            <option value="normal">Normal</option>
            <option value="medium">Medium</option>
            <option value="bold">Bold</option>
          </Select>
        </FieldRow>
        <FieldRow label="Align">
          <Select value={el.align} onChange={(e) => patch({ align: e.target.value as LabTextElement["align"] })} containerClassName="w-full">
            <option value="left">Left</option>
            <option value="center">Center</option>
            <option value="right">Right</option>
          </Select>
        </FieldRow>
      </div>
    </>
  );
}

function ShapeProps({ el, patch }: { el: LabShapeElement; patch: (p: Partial<LabShapeElement>) => void }) {
  return (
    <>
      <FieldRow label="Shape">
        <Select value={el.shape} onChange={(e) => patch({ shape: e.target.value as LabShapeElement["shape"] })} containerClassName="w-full">
          <option value="rectangle">Rectangle</option>
          <option value="ellipse">Ellipse</option>
          <option value="line">Line</option>
        </Select>
      </FieldRow>
      <div className="grid grid-cols-2 gap-2">
        <FieldRow label="Fill">
          <Input type="color" value={el.fill} className="h-7 w-full cursor-pointer p-0.5" onChange={(e) => patch({ fill: e.target.value })} />
        </FieldRow>
        <FieldRow label="Stroke">
          <Input type="color" value={el.stroke} className="h-7 w-full cursor-pointer p-0.5" onChange={(e) => patch({ stroke: e.target.value })} />
        </FieldRow>
      </div>
    </>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <Label className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function NumberInput({ value, step = 1, min, onChange }: { value: number; step?: number; min?: number; onChange: (v: number) => void }) {
  return (
    <Input
      type="number"
      step={step}
      min={min}
      value={value}
      className="h-7 text-xs"
      onChange={(e) => {
        const v = parseFloat(e.target.value);
        if (!isNaN(v)) onChange(v);
      }}
    />
  );
}
