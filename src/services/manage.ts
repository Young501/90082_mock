import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { ParticipantsResponse, ParticipantsFilterParams } from "@/types/dashboard";

export const getParticipants = async (
  opportunityId: string,
  params: ParticipantsFilterParams
): Promise<ParticipantsResponse> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value.toString());
    }
  });

  const url = `${API_ENDPOINTS.OPPORTUNITY_PARTICIPANTS(opportunityId).url}?${queryParams.toString()}`;
  
  return apiRequest({
    endpoint: {
      method: "GET",
      url,
    },
  });
};

export function useParticipants(
  opportunityId: string,
  params: ParticipantsFilterParams
) {
  return useQuery({
    queryKey: ["participants", opportunityId, params],
    queryFn: () => getParticipants(opportunityId, params),
    enabled: !!opportunityId,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
} 