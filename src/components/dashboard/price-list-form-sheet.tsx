"use client";

import { useEffect } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { useCreatePriceList, useUpdatePriceList } from "@/hooks/use-pricing";
import { usePublishedLabProducts } from "@/hooks/use-lab";
import { COUNTRIES, getCurrency } from "@/config/currency";
import type { ApiError, PriceItemType, PriceList } from "@/types";

const PRICE_ITEM_TYPE_LABELS: Record<PriceItemType, string> = {
  single_print: "Single print",
  digital_download: "Digital download",
  package: "Package",
  addon: "Add-on",
};

const itemSchema = z.object({
  type: z.enum(["single_print", "digital_download", "package", "addon"]),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  amount: z.coerce.number().min(0, "Must be 0 or higher"),
  unitsIncluded: z.coerce.number().optional(),
  labProductId: z.string().optional(),
  previewImageUrl: z.string().optional(),
});

const tierSchema = z.object({
  minQuantity: z.coerce.number().min(1, "Must be at least 1"),
  discountPercent: z.coerce.number().min(1, "Must be at least 1").max(100, "Must be 100 or lower"),
});

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  countryCode: z.string().min(1, "Select a country"),
  items: z.array(itemSchema).min(1, "Add at least one item"),
  bulkDiscounts: z.array(tierSchema),
});

type FormValues = z.infer<typeof schema>;

function defaultsFor(priceList: PriceList | null): FormValues {
  if (!priceList) {
    return {
      name: "",
      countryCode: "US",
      items: [{ type: "digital_download", name: "Digital Download (HD)", description: "", amount: 8, unitsIncluded: undefined, labProductId: undefined, previewImageUrl: undefined }],
      bulkDiscounts: [],
    };
  }
  return {
    name: priceList.name,
    countryCode: priceList.countryCode,
    items: priceList.items.map((item) => ({
      type: item.type,
      name: item.name,
      description: item.description ?? "",
      amount: item.amount,
      unitsIncluded: item.unitsIncluded,
      labProductId: item.labProductId ?? undefined,
      previewImageUrl: item.previewImageUrl ?? undefined,
    })),
    bulkDiscounts: priceList.bulkDiscounts.map((tier) => ({ minQuantity: tier.minQuantity, discountPercent: tier.discountPercent })),
  };
}

interface PriceListFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  priceList?: PriceList | null;
  onSaved?: (priceList: PriceList) => void;
}

export function PriceListFormSheet({ open, onOpenChange, schoolId, priceList = null, onSaved }: PriceListFormSheetProps) {
  const isEdit = !!priceList;
  const createPriceList = useCreatePriceList(schoolId);
  const updatePriceList = useUpdatePriceList(schoolId);
  const { data: labProducts } = usePublishedLabProducts();
  const isSaving = createPriceList.isPending || updatePriceList.isPending;

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFor(priceList) });

  useEffect(() => {
    if (open) reset(defaultsFor(priceList));
  }, [open, priceList, reset]);

  const itemsArray = useFieldArray({ control, name: "items" });
  const tiersArray = useFieldArray({ control, name: "bulkDiscounts" });
  const countryCode = watch("countryCode");
  const items = watch("items");

  const onSubmit = handleSubmit(async (values) => {
    const currencyCode = getCurrency(COUNTRIES.find((c) => c.code === values.countryCode)?.currencyCode ?? "USD").code;
    const payload = {
      name: values.name,
      countryCode: values.countryCode,
      currencyCode,
      items: values.items.map((item) => ({
        type: item.type,
        name: item.name,
        description: item.description || undefined,
        amount: item.amount,
        unitsIncluded: item.type === "package" ? item.unitsIncluded : undefined,
        labProductId: item.labProductId || null,
        previewImageUrl: item.previewImageUrl || undefined,
      })),
      bulkDiscounts: values.bulkDiscounts,
    };

    try {
      const saved = isEdit ? await updatePriceList.mutateAsync({ id: priceList!.id, input: payload }) : await createPriceList.mutateAsync(payload);
      toast.success(isEdit ? "Price list updated." : "Price list created.");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't save the price list. Please try again.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit price list" : "Add price list"}
      description={isEdit ? "Update pricing, packages, and bulk discounts." : "Create a reusable pricing template for albums and schools."}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="price-list-name">Name</Label>
          <Input id="price-list-name" {...register("name")} placeholder="US Standard Pricing" />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="price-list-country">Country / Currency</Label>
          <Select id="price-list-country" value={countryCode} onChange={(e) => setValue("countryCode", e.target.value)}>
            {COUNTRIES.map((country) => (
              <option key={country.code} value={country.code}>
                {country.name} · {getCurrency(country.currencyCode).code}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Items</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => itemsArray.append({ type: "digital_download", name: "", description: "", amount: 0, unitsIncluded: undefined })}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>
          {errors.items?.message ? <p className="text-sm text-destructive">{errors.items.message}</p> : null}

          <div className="space-y-3">
            {itemsArray.fields.map((field, index) => (
              <div key={field.id} className="space-y-3 rounded-lg border border-border p-4">
                {/* Lab product link */}
                {labProducts && labProducts.length > 0 ? (
                  <div className="space-y-1.5">
                    <Label htmlFor={`item-${index}-lab`} className="text-xs text-muted-foreground">Link to Lab product (optional)</Label>
                    <Select
                      id={`item-${index}-lab`}
                      value={items[index]?.labProductId ?? ""}
                      onChange={(e) => {
                        const labId = e.target.value;
                        setValue(`items.${index}.labProductId`, labId || undefined);
                        if (labId) {
                          const lp = labProducts.find((p) => p.id === labId);
                          if (lp) {
                            setValue(`items.${index}.name`, lp.name);
                            setValue(`items.${index}.amount`, lp.price);
                            setValue(`items.${index}.previewImageUrl`, lp.previewImageUrl);
                          }
                        } else {
                          setValue(`items.${index}.previewImageUrl`, undefined);
                        }
                      }}
                      containerClassName="w-full"
                    >
                      <option value="">— No Lab product —</option>
                      {labProducts.map((lp) => (
                        <option key={lp.id} value={lp.id}>
                          {lp.name} ({lp.dimensions.label} · {lp.currencyCode} {lp.price})
                        </option>
                      ))}
                    </Select>
                    {items[index]?.previewImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={items[index].previewImageUrl} alt="preview" className="h-16 w-24 rounded object-cover" />
                    ) : null}
                  </div>
                ) : null}

                <div className="flex items-start justify-between gap-3">
                  <div className="grid flex-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-${index}-name`}>Name</Label>
                      <Input id={`item-${index}-name`} {...register(`items.${index}.name`)} placeholder="6x4&quot; Print" />
                      {errors.items?.[index]?.name ? <p className="text-xs text-destructive">{errors.items[index]?.name?.message}</p> : null}
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-${index}-type`}>Type</Label>
                      <Select
                        id={`item-${index}-type`}
                        value={items[index]?.type}
                        onChange={(e) => setValue(`items.${index}.type`, e.target.value as PriceItemType)}
                      >
                        {(Object.keys(PRICE_ITEM_TYPE_LABELS) as PriceItemType[]).map((value) => (
                          <option key={value} value={value}>
                            {PRICE_ITEM_TYPE_LABELS[value]}
                          </option>
                        ))}
                      </Select>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="mt-6 shrink-0 text-muted-foreground hover:text-destructive"
                    onClick={() => itemsArray.remove(index)}
                    disabled={itemsArray.fields.length <= 1}
                    aria-label="Remove item"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor={`item-${index}-description`}>Description</Label>
                  <Input id={`item-${index}-description`} {...register(`items.${index}.description`)} placeholder="Glossy photographic print" />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor={`item-${index}-amount`}>Price</Label>
                    <Input id={`item-${index}-amount`} type="number" step="0.01" min="0" {...register(`items.${index}.amount`)} />
                    {errors.items?.[index]?.amount ? <p className="text-xs text-destructive">{errors.items[index]?.amount?.message}</p> : null}
                  </div>
                  {items[index]?.type === "package" ? (
                    <div className="space-y-1.5">
                      <Label htmlFor={`item-${index}-units`}>Units included</Label>
                      <Input id={`item-${index}-units`} type="number" min="1" {...register(`items.${index}.unitsIncluded`)} />
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Bulk discounts</Label>
            <Button type="button" variant="outline" size="sm" onClick={() => tiersArray.append({ minQuantity: 5, discountPercent: 10 })}>
              <Plus className="h-4 w-4" />
              Add tier
            </Button>
          </div>
          {tiersArray.fields.length === 0 ? (
            <p className="text-xs text-muted-foreground">No bulk discount tiers — customers always pay full price.</p>
          ) : (
            <div className="space-y-3">
              {tiersArray.fields.map((field, index) => (
                <div key={field.id} className="flex items-end gap-3 rounded-lg border border-border p-4">
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`tier-${index}-min`}>Minimum quantity</Label>
                    <Input id={`tier-${index}-min`} type="number" min="1" {...register(`bulkDiscounts.${index}.minQuantity`)} />
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`tier-${index}-percent`}>Discount (%)</Label>
                    <Input id={`tier-${index}-percent`} type="number" min="1" max="100" {...register(`bulkDiscounts.${index}.discountPercent`)} />
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-destructive"
                    onClick={() => tiersArray.remove(index)}
                    aria-label="Remove tier"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create price list"}
        </Button>
      </form>
    </Sheet>
  );
}
