import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { UserSearchParams } from "@/types/discovery";
import { UserSearchResponse } from "@/types/shared";

export function useUserSearch(params: UserSearchParams | null) {
  return useQuery({
    queryKey: ["users", "search", params],
    queryFn: async (): Promise<UserSearchResponse> => {
      if (!params || !params.user_type) {
        return { count: 0, next: null, previous: null, results: [] };
      }

      const queryParams: Record<string, string | number> = {};

      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          if (Array.isArray(value)) {
            queryParams[key] = value.join(",");
          } else {
            queryParams[key] = value.toString();
          }
        }
      });

      const data = await apiRequest({
        endpoint: API_ENDPOINTS.USERS_SEARCH,
        params: queryParams,
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
    enabled: !!params?.user_type && !!params?.opportunity_id,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
