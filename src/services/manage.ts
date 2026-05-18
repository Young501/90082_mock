import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  ParticipantsResponse,
  ParticipantsFilterParams,
  MatchStudent,
} from "@/types/dashboard";

export const getParticipants = async (
  opportunityId: string,
  params: ParticipantsFilterParams
): Promise<ParticipantsResponse> => {
  const queryParams: Record<string, string | number> = {};

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams[key] = value.toString();
    }
  });

  return apiRequest({
    endpoint: API_ENDPOINTS.COORDINATOR_OPP_PARTICIPANTS(opportunityId),
    params: queryParams,
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

export const matchStudent = async (
  opportunityId: string,
  matchStudent: MatchStudent
) => {
  return apiRequest({
    endpoint: API_ENDPOINTS.MATCH(opportunityId),
    body: matchStudent,
  });
};

export function useMatchStudent(opportunityId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (matchStudentData: MatchStudent) =>
      matchStudent(opportunityId, matchStudentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

export const unmatch = async (opportunityId: string, matchId: string) => {
  return apiRequest({
    endpoint: API_ENDPOINTS.UNMATCH(opportunityId, matchId),
    body: {
      match_id: matchId,
      opportunity_id: opportunityId,
    },
  });
};

export function useUnmatch(opportunityId: string, matchId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => unmatch(opportunityId, matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
    onError: (error: any) => {
      console.error(error);
    },
  });
}
