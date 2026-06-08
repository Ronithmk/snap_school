"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { pricingService } from "@/services";
import type { CreatePriceListInput, UpdatePriceListInput } from "@/types";

const LIST_KEY = ["price-lists"] as const;

export function usePriceLists() {
  return useQuery({ queryKey: LIST_KEY, queryFn: () => pricingService.list() });
}

export function useDefaultPriceListForCountry(countryCode: string | undefined) {
  return useQuery({
    queryKey: ["price-list", "default", countryCode],
    queryFn: () => pricingService.getDefaultForCountry(countryCode!),
    enabled: !!countryCode,
  });
}

export function useCreatePriceList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePriceListInput) => pricingService.create(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  });
}

export function useUpdatePriceList() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePriceListInput }) => pricingService.update(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: LIST_KEY }),
  });
}
