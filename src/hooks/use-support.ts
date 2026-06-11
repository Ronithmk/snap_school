"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supportService } from "@/services";
import type { SupportTicketInput, SupportTicketStatus } from "@/types";

export function useSubmitSupportTicket() {
  return useMutation({
    mutationFn: (input: SupportTicketInput) => supportService.submit(input),
  });
}

export function useSupportTickets() {
  return useQuery({
    queryKey: ["support-tickets"],
    queryFn: () => supportService.list(),
  });
}

export function useUpdateSupportTicketStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: SupportTicketStatus }) =>
      supportService.updateStatus(ticketId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["support-tickets"] });
    },
  });
}
