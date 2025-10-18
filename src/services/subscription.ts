import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store";
import { SubscriptionStatusResponse } from "@/types/opportunities";

// Get subscription status for a specific opportunity participant
export function useSubscriptionStatus(
  opportunityParticipantId: number,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: ["subscription-status", opportunityParticipantId],
    queryFn: () =>
      apiRequest<SubscriptionStatusResponse>({
        endpoint: API_ENDPOINTS.SUBSCRIPTION_STATUS,
        params: {
          opportunity_participant_id: opportunityParticipantId,
        },
      }),
    enabled: enabled && !!opportunityParticipantId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 404 (no subscription found)
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Cancel subscription for a specific opportunity participant
export function useCancelSubscription() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityParticipantId: number) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.SUBSCRIPTION_CANCEL,
        body: {
          opportunity_participant_id: opportunityParticipantId,
        },
      });
    },
    onSuccess: (_, opportunityParticipantId) => {
      // Invalidate subscription status for this participant
      queryClient.invalidateQueries({
        queryKey: ["subscription-status", opportunityParticipantId],
      });

      // Also invalidate accessible opportunities to refresh the UI
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });
    },
  });
}
