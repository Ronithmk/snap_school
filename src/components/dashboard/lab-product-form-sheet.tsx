"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useCreateLabProduct, useUpdateLabProduct } from "@/hooks/use-lab";
import { LAB_PRODUCT_TYPE_LABELS } from "@/config/constants";
import { CURRENCIES } from "@/config/currency";
import { LAB_SIZE_PRESETS } from "@/types";
import type { ApiError, CreateLabProductInput, LabOrientation, LabProduct, LabProductType } from "@/types";

const CUSTOM_SIZE = "__custom__";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  type: z.string().min(1),
  category: z.string().min(1, "Category is required"),
  sizePreset: z.string(),
  widthCm: z.coerce.number().positive("Width must be positive"),
  heightCm: z.coerce.number().positive("Height must be positive"),
  sizeLabel: z.string().min(1, "Size label is required"),
  orientation: z.enum(["portrait", "landscape", "square"]),
  price: z.coerce.number().min(0, "Price must be 0 or greater"),
  currencyCode: z.string().min(1),
  taxIncluded: z.boolean(),
  tags: z.string(),
});

type FormValues = z.infer<typeof schema>;

function defaultsFor(product: LabProduct | null): FormValues {
  if (!product) {
    return {
      name: "",
      description: "",
      type: "single_print",
      category: "",
      sizePreset: "10x15",
      widthCm: 10,
      heightCm: 15,
      sizeLabel: "10x15",
      orientation: "portrait",
      price: 0,
      currencyCode: "USD",
      taxIncluded: true,
      tags: "",
    };
  }
  const preset = LAB_SIZE_PRESETS.find(
    (p) => p.widthCm === product.dimensions.widthCm && p.heightCm === product.dimensions.heightCm,
  );
  return {
    name: product.name,
    description: product.description ?? "",
    type: product.type,
    category: product.category,
    sizePreset: preset ? preset.label : CUSTOM_SIZE,
    widthCm: product.dimensions.widthCm,
    heightCm: product.dimensions.heightCm,
    sizeLabel: product.dimensions.label,
    orientation: product.orientation,
    price: product.price,
    currencyCode: product.currencyCode,
    taxIncluded: product.taxIncluded,
    tags: product.tags.join(", "),
  };
}

interface LabProductFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  product?: LabProduct | null;
  onSaved?: (product: LabProduct) => void;
}

export function LabProductFormSheet({ open, onOpenChange, schoolId, product = null, onSaved }: LabProductFormSheetProps) {
  const isEdit = !!product;
  const create = useCreateLabProduct(schoolId);
  const update = useUpdateLabProduct(schoolId);
  const isSaving = create.isPending || update.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFor(product) });

  useEffect(() => {
    if (!open) return;
    reset(defaultsFor(product));
  }, [open, product, reset]);

  const sizePreset = watch("sizePreset");
  const taxIncluded = watch("taxIncluded");

  function handleSizePresetChange(label: string) {
    setValue("sizePreset", label);
    if (label !== CUSTOM_SIZE) {
      const preset = LAB_SIZE_PRESETS.find((p) => p.label === label);
      if (preset) {
        setValue("widthCm", preset.widthCm);
        setValue("heightCm", preset.heightCm);
        setValue("sizeLabel", preset.label);
      }
    }
  }

  const onSubmit = handleSubmit(async (values) => {
    const input: CreateLabProductInput = {
      name: values.name,
      description: values.description || undefined,
      type: values.type as LabProductType,
      category: values.category,
      dimensions: { label: values.sizeLabel, widthCm: values.widthCm, heightCm: values.heightCm },
      orientation: values.orientation as LabOrientation,
      price: values.price,
      currencyCode: values.currencyCode,
      taxIncluded: values.taxIncluded,
      tags: values.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
    };

    try {
      const saved = isEdit
        ? await update.mutateAsync({ id: product!.id, input })
        : await create.mutateAsync(input);
      toast.success(isEdit ? "Product updated." : "Product created. Open the editor to design its layout.");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't save the product. Please try again.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit product" : "New product"}
      description={isEdit ? "Update this product's metadata." : "Define the product details — you can design the layout in the editor."}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="lab-name">Name</Label>
          <Input id="lab-name" {...register("name")} placeholder="Portrait 13x18 colour" />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="lab-description">Description</Label>
          <Textarea id="lab-description" rows={2} {...register("description")} placeholder="Short description shown in the price list…" />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lab-type">Product type</Label>
            <Select id="lab-type" {...register("type")}>
              {(Object.keys(LAB_PRODUCT_TYPE_LABELS) as LabProductType[]).map((value) => (
                <option key={value} value={value}>
                  {LAB_PRODUCT_TYPE_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="lab-category">Category</Label>
            <Input id="lab-category" {...register("category")} placeholder="Prints, Sheets, Cards…" />
            {errors.category ? <p className="text-sm text-destructive">{errors.category.message}</p> : null}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lab-size-preset">Size preset</Label>
          <Select
            id="lab-size-preset"
            value={sizePreset}
            onChange={(e) => handleSizePresetChange(e.target.value)}
          >
            {LAB_SIZE_PRESETS.map((p) => (
              <option key={p.label} value={p.label}>
                {p.label} ({p.widthCm} × {p.heightCm} cm)
              </option>
            ))}
            <option value={CUSTOM_SIZE}>Custom size…</option>
          </Select>
        </div>

        {sizePreset === CUSTOM_SIZE ? (
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="lab-width">Width (cm)</Label>
              <Input id="lab-width" type="number" step="0.1" {...register("widthCm")} />
              {errors.widthCm ? <p className="text-sm text-destructive">{errors.widthCm.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lab-height">Height (cm)</Label>
              <Input id="lab-height" type="number" step="0.1" {...register("heightCm")} />
              {errors.heightCm ? <p className="text-sm text-destructive">{errors.heightCm.message}</p> : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lab-size-label">Label</Label>
              <Input id="lab-size-label" {...register("sizeLabel")} placeholder="e.g. 15x20" />
              {errors.sizeLabel ? <p className="text-sm text-destructive">{errors.sizeLabel.message}</p> : null}
            </div>
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="lab-orientation">Orientation</Label>
          <Select id="lab-orientation" {...register("orientation")}>
            <option value="portrait">Portrait</option>
            <option value="landscape">Landscape</option>
            <option value="square">Square</option>
          </Select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="lab-price">Price</Label>
            <Input id="lab-price" type="number" step="0.01" min="0" {...register("price")} />
            {errors.price ? <p className="text-sm text-destructive">{errors.price.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="lab-currency">Currency</Label>
            <Select id="lab-currency" {...register("currencyCode")}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.code} – {c.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="text-sm font-medium">Tax included in price</p>
            <p className="text-xs text-muted-foreground">Toggle off if the price shown is before tax.</p>
          </div>
          <Switch checked={taxIncluded} onCheckedChange={(checked) => setValue("taxIncluded", checked)} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="lab-tags">Tags</Label>
          <Input id="lab-tags" {...register("tags")} placeholder="individual, vertical siblings, siblings (comma-separated)" />
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create product"}
        </Button>
      </form>
    </Sheet>
  );
}
