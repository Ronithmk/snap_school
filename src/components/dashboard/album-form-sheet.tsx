"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { BrainCircuit, Loader2, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Sheet } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { useCreateAlbum, useUpdateAlbum } from "@/hooks/use-albums";
import { useStudents } from "@/hooks/use-students";
import { cn } from "@/lib/utils";
import type { Album, ApiError, SchoolClass } from "@/types";

const schema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens"),
  classId: z.string(),
  studentId: z.string(),
  description: z.string().optional(),
  eventDate: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

const NO_CLASS = "__none__";
const NO_STUDENT = "__none__";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function defaultsFor(album: Album | null): FormValues {
  if (!album) {
    return { title: "", slug: "", classId: NO_CLASS, studentId: NO_STUDENT, description: "", eventDate: "" };
  }
  return {
    title: album.title,
    slug: album.slug,
    classId: album.classId ?? NO_CLASS,
    studentId: album.studentId ?? NO_STUDENT,
    description: album.description ?? "",
    eventDate: album.eventDate ? album.eventDate.slice(0, 10) : "",
  };
}

interface AlbumFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  schoolId: string;
  classes: SchoolClass[];
  defaultClassId?: string | null;
  album?: Album | null;
  onSaved?: (album: Album) => void;
}

export function AlbumFormSheet({ open, onOpenChange, schoolId, classes, defaultClassId, album = null, onSaved }: AlbumFormSheetProps) {
  const isEdit = !!album;
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
  const classId = watch("classId");
  const studentId = watch("studentId");

  const hasClass = classId !== NO_CLASS;
  const { data: studentsData } = useStudents(hasClass ? schoolId : undefined, hasClass ? classId : undefined);
  const students = studentsData ?? [];
  const selectedStudent = students.find((s) => s.id === studentId);

  useEffect(() => {
    setValue("studentId", NO_STUDENT);
  }, [classId, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    const payload = {
      title: values.title,
      slug: values.slug,
      classId: values.classId === NO_CLASS ? null : values.classId,
      studentId: values.studentId === NO_STUDENT ? null : values.studentId,
      description: values.description || undefined,
      visibility: "private" as const,
      eventDate: values.eventDate ? new Date(values.eventDate).toISOString() : undefined,
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
      description={isEdit ? "Update this album's details." : "Create a new album — all albums are private by default."}
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
            placeholder="Spring Portraits 2026"
          />
          {errors.title ? <p className="text-sm text-destructive">{errors.title.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="album-slug">Slug</Label>
          <Input id="album-slug" {...register("slug")} placeholder="spring-portraits-2026" />
          {errors.slug ? <p className="text-sm text-destructive">{errors.slug.message}</p> : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="album-description">Description</Label>
          <Textarea id="album-description" rows={2} {...register("description")} />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="album-class">Class</Label>
            <Select id="album-class" value={classId} onChange={(e) => setValue("classId", e.target.value)}>
              <option value={NO_CLASS}>School-wide (no class)</option>
              {classes.map((schoolClass) => (
                <option key={schoolClass.id} value={schoolClass.id}>{schoolClass.name}</option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="album-event-date">Event date</Label>
            <Input id="album-event-date" type="date" {...register("eventDate")} />
          </div>
        </div>

        {hasClass ? (
          <div className="space-y-3 rounded-lg border border-border p-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">Assign to one student</p>
            </div>
            <p className="text-xs text-muted-foreground">
              Select a student to enforce 1-album-1-kid. Leave unset for group or event albums.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Select id="album-student" value={studentId} onChange={(e) => setValue("studentId", e.target.value)}>
                  <option value={NO_STUDENT}>Group / event album (no student)</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>{s.name} — #{s.number}</option>
                  ))}
                </Select>
              </div>
              {selectedStudent?.coverPhotoUrl ? (
                <img
                  src={selectedStudent.coverPhotoUrl}
                  alt={selectedStudent.name}
                  className={cn("h-9 w-9 shrink-0 rounded-full object-cover ring-2 ring-primary")}
                />
              ) : null}
            </div>
          </div>
        ) : null}

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
          <BrainCircuit className="h-4 w-4 text-primary" />
          <div className="flex-1">
            <p className="text-xs font-medium">AI face matching enabled</p>
            <p className="text-[11px] text-muted-foreground">Mismatched faces are auto-flagged for review.</p>
          </div>
          <span className="rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-400">ON</span>
        </div>

        <Button type="submit" className="w-full" disabled={isSaving}>
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {isEdit ? "Save changes" : "Create album"}
        </Button>
      </form>
    </Sheet>
  );
}
