"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { parentService } from "@/services";
import { ORDERS_PAGE_SIZE } from "@/config/constants";
import type { LinkChildInput, OrderListFilters, ParentRegisterInput, QueryParams } from "@/types";

export function useParentRegister() {
  return useMutation({
    mutationFn: (input: ParentRegisterInput) => parentService.register(input),
  });
}

export function useParentChildren() {
  return useQuery({
    queryKey: ["parent-children"],
    queryFn: () => parentService.getChildren(),
  });
}

export function useLinkChild() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LinkChildInput) => parentService.linkChild(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parent-children"] });
    },
  });
}

export function useParentOrders(filters: OrderListFilters & QueryParams = {}) {
  return useQuery({
    queryKey: ["parent-orders", filters],
    queryFn: () => parentService.getOrders({ pageSize: ORDERS_PAGE_SIZE, ...filters }),
  });
}
