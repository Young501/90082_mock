import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  UserSearchParams,
  DiscoveryRequestBody,
  FacetsResponse,
  SearchResponse,
} from "@/types/discovery";
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

export function useDiscoveryFacets(
  opportunityId: string | null,
  body: DiscoveryRequestBody | null
) {
  return useQuery({
    queryKey: ["discovery", "facets", opportunityId, body],
    queryFn: async (): Promise<FacetsResponse> => {
      if (!opportunityId || !body) {
        return {
          facets: {
            onboarding: {},
            questionnaire: {},
          },
        };
      }

      const data = await apiRequest<FacetsResponse>({
        endpoint: API_ENDPOINTS.DISCOVERY_FACETS(opportunityId),
        body,
      });

      return data;
    },
    enabled: !!opportunityId && !!body,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useDiscoverySearch(
  opportunityId: string | null,
  body: DiscoveryRequestBody | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ["discovery", "search", opportunityId, body, page, pageSize],
    queryFn: async (): Promise<SearchResponse> => {
      if (!opportunityId || !body) {
        return {
          results: [],
          page: {
            count: 0,
            next: null,
            previous: null,
          },
        };
      }


      const data = await apiRequest<SearchResponse>({
        endpoint: API_ENDPOINTS.DISCOVERY_SEARCH(opportunityId),
        body,
        params: { page, page_size: pageSize },
      });

      return data;
    },
    enabled: !!opportunityId && !!body,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}
