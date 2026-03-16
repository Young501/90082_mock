import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS, apiRequest } from "@/api";
import type { HomepageStats } from "@/types/homepage";

export const getDashboardStats = async (opportunityId: string) => {
  return apiRequest({
    endpoint: API_ENDPOINTS.OPPORTUNITY_DASHBOARD(opportunityId),
  });
};

export const getHomepage = async (): Promise<HomepageStats> => {
  return apiRequest({
    endpoint: API_ENDPOINTS.HOMEPAGE,
  });
};

export function useSetDefaultOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string | number) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.SET_DEFAULT_OPPORTUNITY(opportunityId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      queryClient.invalidateQueries({ queryKey: ["accessible-opportunities"] });
    },
  });
}

export function useClearDefaultOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (opportunityId: string | number) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.CLEAR_DEFAULT_OPPORTUNITY(opportunityId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      queryClient.invalidateQueries({ queryKey: ["accessible-opportunities"] });
    },
  });
}
