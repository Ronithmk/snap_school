"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { labService } from "@/services";
import { LAB_PRODUCTS_PAGE_SIZE } from "@/config/constants";
import type { CreateLabProductInput, LabExportFormat, LabProductListFilters, QueryParams, UpdateLabProductInput } from "@/types";

export function useLabProducts(schoolId: string | undefined, filters: LabProductListFilters & QueryParams = {}) {
  return useQuery({
    queryKey: ["lab-products", schoolId, filters],
    queryFn: () => labService.listBySchool(schoolId!, { pageSize: LAB_PRODUCTS_PAGE_SIZE, ...filters }),
    enabled: !!schoolId,
  });
}

export function usePublishedLabProducts() {
  return useQuery({
    queryKey: ["lab-products", "published"],
    queryFn: () => labService.listPublished(),
  });
}

export function useLabProduct(productId: string | undefined) {
  return useQuery({
    queryKey: ["lab-product", productId],
    queryFn: () => labService.getById(productId!),
    enabled: !!productId,
  });
}

export function useCreateLabProduct(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateLabProductInput) => labService.create(schoolId!, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lab-products", schoolId] }),
  });
}

export function useUpdateLabProduct(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateLabProductInput }) => labService.update(id, input),
    onSuccess: (product) => {
      queryClient.invalidateQueries({ queryKey: ["lab-products", schoolId] });
      queryClient.invalidateQueries({ queryKey: ["lab-product", product.id] });
      queryClient.invalidateQueries({ queryKey: ["lab-products", "published"] });
    },
  });
}

export function useDuplicateLabProduct(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labService.duplicate(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lab-products", schoolId] }),
  });
}

export function useDeleteLabProduct(schoolId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => labService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["lab-products", schoolId] }),
  });
}

export function useExportLabProduct() {
  return useMutation({
    mutationFn: ({ productId, format }: { productId: string; format: LabExportFormat }) => labService.requestExport(productId, format),
  });
}
