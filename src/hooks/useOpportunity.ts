import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { Opportunity } from "@/types/opportunities";

export function useOpportunityDetail(opportunityId: string) {
  return useQuery({
    queryKey: ["opportunity", opportunityId],
    queryFn: async (): Promise<Opportunity> => {
      return apiRequest({
        endpoint: API_ENDPOINTS.OPPORTUNITY_DETAIL(opportunityId),
      });
    },
    enabled: !!opportunityId,
  });
}

export interface ParticipantRequest {
  email: string;
  user_type: string;
  questionnaire_answers: Record<string, any>;
}

export function useEnrollInOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({
      opportunityId,
      data,
    }: {
      opportunityId: string;
      data: ParticipantRequest;
    }) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.OPPORTUNITY_ENROLLMENT(opportunityId),
        body: data,
      });
    },
    onSuccess: (_data, { opportunityId }) => {
      // Invalidate opportunity detail to refetch with updated enrollment status
      queryClient.invalidateQueries({
        queryKey: ["opportunity", opportunityId],
      });
      
      // Invalidate accessible opportunities to update enrollment status
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities"],
      });
      
      // Invalidate accepted opportunities as well since enrollment status changed
      queryClient.invalidateQueries({
        queryKey: ["accepted-opportunities"],
      });
    },
  });
}