"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sheet } from "@/components/ui/sheet";
import { useCreateClass, useUpdateClass } from "@/hooks/use-albums";
import type { ApiError, SchoolClass } from "@/types";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  grouping: z.string().optional(),
  studentCount: z.union([z.coerce.number().min(0), z.literal("")]).optional(),
});

type FormValues = z.infer<typeof schema>;

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultsFor(schoolClass: SchoolClass | null): FormValues {
  if (!schoolClass) return { name: "", slug: "", grouping: "", studentCount: "" };
  return {
    name: schoolClass.name,
    slug: schoolClass.slug,
    grouping: schoolClass.grouping ?? "",
    studentCount: schoolClass.studentCount ?? "",
  };
}

interface ClassFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  schoolClass?: SchoolClass | null;
  onSaved?: (schoolClass: SchoolClass) => void;
}

export function ClassFormSheet({ open, onOpenChange, schoolId, schoolClass = null, onSaved }: ClassFormSheetProps) {
  const isEdit = !!schoolClass;
  const createClass = useCreateClass(schoolId);
  const updateClass = useUpdateClass(schoolId);
  const isSaving = createClass.isPending || updateClass.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFor(schoolClass) });

  useEffect(() => {
    if (open) reset(defaultsFor(schoolClass));
  }, [open, schoolClass, reset]);

  const name = watch("name");
  const slug = watch("slug");

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      grouping: values.grouping || undefined,
      studentCount: values.studentCount === "" ? undefined : Number(values.studentCount),
    };

    try {
      const saved = isEdit
        ? await updateClass.mutateAsync({ id: schoolClass!.id, input: payload })
        : await createClass.mutateAsync(payload);
      toast.success(isEdit ? "Class updated." : "Class created.");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't save the class. Please try again.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit class" : "Add class"}
      description={isEdit ? "Update this class's details." : "Group albums by class, grade, or event."}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="class-name">Name</Label>
          <Input
            id="class-name"
            {...register("name")}
            onChange={(e) => {
              setValue("name", e.target.value);
              if (!isEdit && (slug === "" || slug === slugify(name))) setValue("slug", slugify(e.target.value));
            }}
            placeholder="Grade 5A"
          />
          {errors.name ? <p className="text-sm text-destructive">{errors.name.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-slug">Slug</Label>
          <Input id="class-slug" {...register("slug")} placeholder="grade-5a" />
          {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-grouping">Grouping</Label>
          <Input id="class-grouping" {...register("grouping")} placeholder="Grade 5, Year 2026, Events…" />
          <p className="text-xs text-muted-foreground">Optional context shown alongside the class name.</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="class-student-count">Student count</Label>
          <Input id="class-student-count" type="number" min="0" {...register("studentCount")} placeholder="Optional" />
          {errors.studentCount ? <p className="text-sm text-destructive">{errors.studentCount.message}</p> : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create class"}
        </Button>
      </form>
    </Sheet>
  );
}
