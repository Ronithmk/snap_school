"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pricingService } from "@/services";
import type { CreatePriceListInput, UpdatePriceListInput } from "@/types";

const listKey = (schoolId: string) => ["price-lists", schoolId] as const;

/** All price lists for a specific school. */
export function usePriceLists(schoolId: string | undefined) {
  return useQuery({
    queryKey: schoolId ? listKey(schoolId) : ["price-lists", "__none__"],
    queryFn: () => pricingService.listBySchool(schoolId!),
    enabled: !!schoolId,
  });
}

/** The default (isDefault=true) price list for a school, used as fallback in the storefront. */
export function useDefaultPriceListForSchool(schoolId: string | undefined) {
  return useQuery({
    queryKey: ["price-list", "default", schoolId],
    queryFn: () => pricingService.getDefaultForSchool(schoolId!),
    enabled: !!schoolId,
  });
}

export function useCreatePriceList(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Omit<CreatePriceListInput, "schoolId">) =>
      pricingService.create({ ...input, schoolId }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey(schoolId) }),
  });
}

export function useUpdatePriceList(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePriceListInput }) =>
      pricingService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: listKey(schoolId) }),
  });
}
