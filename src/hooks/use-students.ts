"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { studentsService } from "@/services";
import type { CreateStudentInput } from "@/types";

const listKey = (schoolId: string, classId?: string) =>
  classId ? ["students", schoolId, classId] : ["students", schoolId];

export function useStudents(schoolId: string | undefined, classId?: string) {
  return useQuery({
    queryKey: schoolId ? listKey(schoolId, classId) : ["students", "__none__"],
    queryFn: () => studentsService.listBySchool(schoolId!, classId),
    enabled: !!schoolId,
  });
}

export function useCreateStudent(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateStudentInput) => studentsService.create(schoolId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students", schoolId] }),
  });
}

export function useUpdateStudent(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: Parameters<typeof studentsService.update>[1] }) =>
      studentsService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students", schoolId] }),
  });
}

export function useDeleteStudent(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students", schoolId] }),
  });
}

/** Public: a student's album, photos, and resolved price list — for the parent QR landing page. */
export function useStudentAlbum(studentId: string | undefined) {
  return useQuery({
    queryKey: ["student-album", studentId],
    queryFn: () => studentsService.getAlbum(studentId!),
    enabled: !!studentId,
  });
}

export function useRegenerateCredentials(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => studentsService.regenerateCredentials(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["students", schoolId] }),
  });
}
