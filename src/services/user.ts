import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { UserSearchParams, UserSearchResponse } from "@/types/discovery";

export function useUserTypes() {
  return useQuery({
    queryKey: ["user-types"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.USER_TYPES }),
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

      const data = await apiRequest({
        endpoint: {
          method: "GET",
          url: `${API_ENDPOINTS.USERS_SEARCH.url}?${queryParams.toString()}`,
        },
      });

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
