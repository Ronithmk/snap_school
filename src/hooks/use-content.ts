"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { contentService } from "@/services";
import type {
  CreateContentBlockInput,
  CreatePricingRuleInput,
  UpdateContentBlockInput,
  UpdatePricingRuleInput,
} from "@/types";

// ── Content Blocks ────────────────────────────────────────────────

const blocksKey = (schoolId: string) => ["content-blocks", schoolId] as const;
const rulesKey = (schoolId: string) => ["pricing-rules", schoolId] as const;

export function useContentBlocks(schoolId: string | undefined) {
  return useQuery({
    queryKey: schoolId ? blocksKey(schoolId) : ["content-blocks", "__none__"],
    queryFn: () => contentService.listBlocks(schoolId!),
    enabled: !!schoolId,
  });
}

export function useCreateContentBlock(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateContentBlockInput) => contentService.createBlock(schoolId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: blocksKey(schoolId) }),
  });
}

export function useUpdateContentBlock(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateContentBlockInput }) =>
      contentService.updateBlock(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: blocksKey(schoolId) }),
  });
}

export function useDeleteContentBlock(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteBlock(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: blocksKey(schoolId) }),
  });
}

export function useReorderContentBlocks(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderedIds: string[]) => contentService.reorderBlocks(schoolId, orderedIds),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: blocksKey(schoolId) }),
  });
}

// ── Pricing Rules ─────────────────────────────────────────────────

export function usePricingRules(schoolId: string | undefined) {
  return useQuery({
    queryKey: schoolId ? rulesKey(schoolId) : ["pricing-rules", "__none__"],
    queryFn: () => contentService.listRules(schoolId!),
    enabled: !!schoolId,
  });
}

export function useCreatePricingRule(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreatePricingRuleInput) => contentService.createRule(schoolId, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rulesKey(schoolId) }),
  });
}

export function useUpdatePricingRule(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdatePricingRuleInput }) =>
      contentService.updateRule(id, input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rulesKey(schoolId) }),
  });
}

export function useDeletePricingRule(schoolId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => contentService.deleteRule(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: rulesKey(schoolId) }),
  });
}
