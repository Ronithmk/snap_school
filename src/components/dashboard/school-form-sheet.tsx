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
import { useCreateSchool, useUpdateSchool } from "@/hooks/use-tenant";
import { COUNTRIES, getCurrency } from "@/config/currency";
import { SCHOOL_STATUS_LABELS } from "@/config/constants";
import type { ApiError, School, SchoolStatus } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  countryCode: z.string().min(1, "Select a country"),
  supportEmail: z.string().email("Enter a valid email address").optional().or(z.literal("")),
  status: z.enum(["active", "inactive", "archived"]),
  taxEnabled: z.boolean(),
  taxLabel: z.string().min(1, "Tax label is required"),
  taxRate: z.coerce.number().min(0, "Must be 0 or higher").max(100, "Must be 100 or lower"),
  taxInclusive: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultsFor(school: School | null): FormValues {
  if (!school) {
    return {
      name: "",
      slug: "",
      description: "",
      countryCode: "US",
      supportEmail: "",
      status: "active",
      taxEnabled: true,
      taxLabel: "Sales Tax",
      taxRate: 0,
      taxInclusive: false,
    };
  }
  return {
    name: school.name,
    slug: school.slug,
    description: school.description ?? "",
    countryCode: school.settings.countryCode,
    supportEmail: school.settings.supportEmail ?? "",
    status: school.status,
    taxEnabled: school.settings.tax.enabled,
    taxLabel: school.settings.tax.label,
    taxRate: school.settings.tax.rate,
    taxInclusive: school.settings.tax.inclusive,
  };
}

interface SchoolFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When provided, the sheet edits this school; otherwise it creates a new one. */
  school?: School | null;
  onSaved?: (school: School) => void;
}

export function SchoolFormSheet({ open, onOpenChange, school = null, onSaved }: SchoolFormSheetProps) {
  const isEdit = !!school;
  const createSchool = useCreateSchool();
  const updateSchool = useUpdateSchool();
  const isSaving = createSchool.isPending || updateSchool.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFor(school) });

  useEffect(() => {
    if (open) reset(defaultsFor(school));
  }, [open, school, reset]);

  const name = watch("name");
  const slug = watch("slug");
  const taxEnabled = watch("taxEnabled");
  const taxInclusive = watch("taxInclusive");
  const status = watch("status");

  const onSubmit = handleSubmit(async (values) => {
    const currencyCode = getCurrency(COUNTRIES.find((c) => c.code === values.countryCode)?.currencyCode ?? "USD").code;
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || undefined,
      settings: {
        countryCode: values.countryCode,
        currencyCode,
        supportEmail: values.supportEmail || undefined,
        tax: {
          enabled: values.taxEnabled,
          rate: values.taxRate,
          label: values.taxLabel,
          inclusive: values.taxInclusive,
        },
      },
    };

    try {
      const saved = isEdit
        ? await updateSchool.mutateAsync({ id: school!.id, input: { ...payload, status: values.status } })
        : await createSchool.mutateAsync(payload);
      toast.success(isEdit ? "School updated." : "School created.");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't save the school. Please try again.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit school" : "Add school"}
      description={isEdit ? "Update tenant details and settings." : "Create a new tenant storefront."}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="school-name">Name</Label>
          <Input
            id="school-name"
            {...register("name")}
            onChange={(e) => {
              setValue("name", e.target.value);
              if (!isEdit && (slug === "" || slug === slugify(name))) setValue("slug", slugify(e.target.value));
            }}
          />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="school-slug">Slug</Label>
          <Input id="school-slug" {...register("slug")} placeholder="riverside-elementary" />
          {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
          <p className="text-xs text-muted-foreground">Storefront URL: /{slug || "your-school"}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="school-description">Description</Label>
          <Textarea id="school-description" rows={3} {...register("description")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="school-country">Country</Label>
            <Select id="school-country" {...register("countryCode")}>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="school-support-email">Support email</Label>
            <Input id="school-support-email" type="email" {...register("supportEmail")} placeholder="photos@school.edu" />
            {errors.supportEmail ? <p className="text-sm text-destructive">{errors.supportEmail.message}</p> : null}
          </div>
        </div>

        {isEdit ? (
          <div className="space-y-2">
            <Label htmlFor="school-status">Status</Label>
            <Select id="school-status" value={status} onChange={(e) => setValue("status", e.target.value as SchoolStatus)}>
              {(Object.keys(SCHOOL_STATUS_LABELS) as SchoolStatus[]).map((value) => (
                <option key={value} value={value}>
                  {SCHOOL_STATUS_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Charge tax on orders</p>
              <p className="text-xs text-muted-foreground">Applies to all storefront checkouts for this school.</p>
            </div>
            <Switch checked={taxEnabled} onCheckedChange={(checked) => setValue("taxEnabled", checked)} />
          </div>

          {taxEnabled ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="tax-label">Tax label</Label>
                <Input id="tax-label" {...register("taxLabel")} placeholder="Sales Tax" />
                {errors.taxLabel ? <p className="text-sm text-destructive">{errors.taxLabel.message}</p> : null}
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Rate (%)</Label>
                <Input id="tax-rate" type="number" step="0.1" min="0" max="100" {...register("taxRate")} />
                {errors.taxRate ? <p className="text-sm text-destructive">{errors.taxRate.message}</p> : null}
              </div>
              <label className="flex items-center gap-2 text-sm sm:col-span-2">
                <Switch checked={taxInclusive} onCheckedChange={(checked) => setValue("taxInclusive", checked)} />
                Prices already include tax
              </label>
            </div>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create school"}
        </Button>
      </form>
    </Sheet>
  );
}
