import { useQuery, useMutation } from "@tanstack/react-query";
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
  });

}