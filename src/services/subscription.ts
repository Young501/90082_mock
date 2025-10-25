import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store";
import { SubscriptionStatusResponse } from "@/types/opportunities";

// useSubscriptionStatus has been removed - use participant record access field instead

// Cancel subscription for a specific opportunity participant
export function useCancelSubscription() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: number) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.SUBSCRIPTION_CANCEL,
        body: {
          opportunity_id: opportunityId,
        },
      });
    },
    onSuccess: (_, opportunityId) => {
      // Invalidate accessible opportunities to refresh the UI
      // This will also refresh the access field in participant records
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });

      // Invalidate opportunity participant records to refresh access field
      queryClient.invalidateQueries({
        queryKey: ["opportunity-participant"],
      });
    },
  });
}
