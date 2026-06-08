"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { schoolsService } from "@/services";
import type { CreateSchoolInput, UpdateSchoolInput } from "@/types";

const SCHOOLS_KEY = ["schools"] as const;

/** Resolves a tenant by its routing slug. Drives every page under `/[school]`. */
export function useSchoolBySlug(slug: string) {
  return useQuery({
    queryKey: ["school", "slug", slug],
    queryFn: () => schoolsService.getBySlug(slug),
    staleTime: 5 * 60_000,
  });
}

export function useSchools(search?: string) {
  return useQuery({
    queryKey: [...SCHOOLS_KEY, { search }],
    queryFn: () => schoolsService.list({ search, pageSize: 50 }),
  });
}

export function useSchool(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["school", schoolId],
    queryFn: () => schoolsService.getById(schoolId!),
    enabled: !!schoolId,
  });
}

export function useCreateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateSchoolInput) => schoolsService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOLS_KEY }),
  });
}

export function useUpdateSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateSchoolInput }) => schoolsService.update(id, input),
    onSuccess: (school) => {
      queryClient.invalidateQueries({ queryKey: SCHOOLS_KEY });
      queryClient.invalidateQueries({ queryKey: ["school", school.id] });
      queryClient.invalidateQueries({ queryKey: ["school", "slug", school.slug] });
    },
  });
}

export function useDeleteSchool() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => schoolsService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: SCHOOLS_KEY }),
  });
}
