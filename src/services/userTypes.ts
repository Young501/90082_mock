import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { UserSearchParams, UserSearchResponse } from "@/types/discovery";
import { apiClient } from "@/api";

export function useUserTypes() {
  return useQuery({
    queryKey: ["user-types"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.USER_TYPES }),
    staleTime: 10 * 60 * 1000,
  });
}

export function useOnboardingPages(userType: string) {
  return useQuery({
    queryKey: ["onboarding-pages", userType],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ONBOARDING_PAGES(userType) }),
    enabled: !!userType,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserSearch(params: UserSearchParams | null) {
  return useQuery({
    queryKey: ["users", "search", params],
    queryFn: async (): Promise<UserSearchResponse> => {
      if (!params || !params.user_type) {
        return { count: 0, next: null, previous: null, results: [] };
      }

      const queryParams = new URLSearchParams();

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            queryParams.append(key, value.join(","));
          } else {
            queryParams.append(key, value.toString());
          }
        }
      });

      const response = await apiClient.get(
        `${API_ENDPOINTS.USERS_SEARCH.url}?${queryParams.toString()}`
      );

      const data = response.data;

      if (Array.isArray(data)) {
        return {
          count: data.length,
          next: null,
          previous: null,
          results: data,
        };
      }

      return data;
    },
    enabled: !!params?.user_type,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
