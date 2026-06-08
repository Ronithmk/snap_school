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
import { useCreateAlbum, useUpdateAlbum } from "@/hooks/use-albums";
import { usePriceLists } from "@/hooks/use-pricing";
import { ALBUM_VISIBILITY_LABELS } from "@/config/constants";
import type { Album, AlbumVisibility, ApiError, SchoolClass } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  classId: z.string(),
  description: z.string().optional(),
  visibility: z.enum(["public", "unlisted", "private"]),
  eventDate: z.string().optional(),
  priceListId: z.string(),
  passwordProtected: z.boolean(),
  password: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const NO_CLASS = "__none__";
const SCHOOL_DEFAULT_PRICING = "__default__";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultsFor(album: Album | null): FormValues {
  if (!album) {
    return {
      title: "",
      slug: "",
      classId: NO_CLASS,
      description: "",
      visibility: "public",
      eventDate: "",
      priceListId: SCHOOL_DEFAULT_PRICING,
      passwordProtected: false,
      password: "",
    };
  }
  return {
    title: album.title,
    slug: album.slug,
    classId: album.classId ?? NO_CLASS,
    description: album.description ?? "",
    visibility: album.visibility,
    eventDate: album.eventDate ? album.eventDate.slice(0, 10) : "",
    priceListId: album.pricing.priceListId ?? SCHOOL_DEFAULT_PRICING,
    passwordProtected: album.passwordProtected,
    password: "",
  };
}

interface AlbumFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  classes: SchoolClass[];
  /** Pre-selects this class for new albums (e.g. when creating from a class detail page). */
  defaultClassId?: string | null;
  album?: Album | null;
  onSaved?: (album: Album) => void;
}

export function AlbumFormSheet({ open, onOpenChange, schoolId, classes, defaultClassId, album = null, onSaved }: AlbumFormSheetProps) {
  const isEdit = !!album;
  const { data: priceLists } = usePriceLists();
  const createAlbum = useCreateAlbum(schoolId);
  const updateAlbum = useUpdateAlbum(schoolId);
  const isSaving = createAlbum.isPending || updateAlbum.isPending;

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ defaultValues: defaultsFor(album) });

  useEffect(() => {
    if (!open) return;
    const defaults = defaultsFor(album);
    if (!album && defaultClassId) defaults.classId = defaultClassId;
    reset(defaults);
  }, [open, album, defaultClassId, reset]);

  const title = watch("title");
  const slug = watch("slug");
  const visibility = watch("visibility");
  const classId = watch("classId");
  const priceListId = watch("priceListId");
  const passwordProtected = watch("passwordProtected");

  const onSubmit = handleSubmit(async (values) => {
    if (values.passwordProtected && !isEdit && !values.password?.trim()) {
      toast.error("Set a password for this protected album.");
      return;
    }

    const payload = {
      title: values.title,
      slug: values.slug,
      classId: values.classId === NO_CLASS ? null : values.classId,
      description: values.description || undefined,
      visibility: values.visibility,
      eventDate: values.eventDate ? new Date(values.eventDate).toISOString() : undefined,
      priceListId: values.priceListId === SCHOOL_DEFAULT_PRICING ? null : values.priceListId,
      password: values.passwordProtected ? values.password?.trim() || undefined : "",
    };

    try {
      const saved = isEdit
        ? await updateAlbum.mutateAsync({ id: album!.id, input: payload })
        : await createAlbum.mutateAsync(payload);
      toast.success(isEdit ? "Album updated." : "Album created.");
      onSaved?.(saved);
      onOpenChange(false);
    } catch (err) {
      toast.error((err as ApiError).message ?? "Couldn't save the album. Please try again.");
    }
  });

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      title={isEdit ? "Edit album" : "Add album"}
      description={isEdit ? "Update this album's details and pricing." : "Create a new gallery for this school."}
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="album-title">Title</Label>
          <Input
            id="album-title"
            {...register("title")}
            onChange={(e) => {
              setValue("title", e.target.value);
              if (!isEdit && (slug === "" || slug === slugify(title))) setValue("slug", slugify(e.target.value));
            }}
            placeholder="Spring Recital 2026"
          />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="album-slug">Slug</Label>
          <Input id="album-slug" {...register("slug")} placeholder="spring-recital-2026" />
          {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="album-description">Description</Label>
          <Textarea id="album-description" rows={3} {...register("description")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="album-class">Class</Label>
            <Select id="album-class" value={classId} onChange={(e) => setValue("classId", e.target.value)}>
              <option value={NO_CLASS}>No class (school-wide)</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>
                  {schoolClass.name}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="album-visibility">Visibility</Label>
            <Select id="album-visibility" value={visibility} onChange={(e) => setValue("visibility", e.target.value as AlbumVisibility)}>
              {(Object.keys(ALBUM_VISIBILITY_LABELS) as AlbumVisibility[]).map((value) => (
                <option key={value} value={value}>
                  {ALBUM_VISIBILITY_LABELS[value]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="album-event-date">Event date</Label>
            <Input id="album-event-date" type="date" {...register("eventDate")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="album-price-list">Pricing</Label>
            <Select id="album-price-list" value={priceListId} onChange={(e) => setValue("priceListId", e.target.value)}>
              <option value={SCHOOL_DEFAULT_PRICING}>Use school default</option>
              {(priceLists ?? []).map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Password protect this album</p>
              <p className="text-xs text-muted-foreground">Visitors must enter a password before browsing photos.</p>
            </div>
            <Switch checked={passwordProtected} onCheckedChange={(checked) => setValue("passwordProtected", checked)} />
          </div>
          {passwordProtected ? (
            <div className="space-y-2">
              <Label htmlFor="album-password">Password</Label>
              <Input id="album-password" {...register("password")} placeholder={isEdit ? "Leave blank to keep current password" : "e.g. sports2026"} />
            </div>
          ) : null}
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create album"}
        </Button>
      </form>
    </Sheet>
  );
}
