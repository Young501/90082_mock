import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  OpportunitySearchRequestBody,
  FacetsResponse,
  SearchResponse,
} from "@/types/opportunity";

export function useOpportunityFacets(
  opportunityId: string | null,
  body: OpportunitySearchRequestBody | null
) {
  return useQuery({
    queryKey: ["opportunity", "facets", opportunityId, body],
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
        endpoint: API_ENDPOINTS.OPPORTUNITY_FACETS(opportunityId),
        body,
      });

      return data;
    },
    enabled: !!opportunityId && !!body,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
}

export function useOpportunitySearch(
  opportunityId: string | null,
  body: OpportunitySearchRequestBody | null,
  page: number = 1,
  pageSize: number = 20
) {
  return useQuery({
    queryKey: ["opportunity", "search", opportunityId, body, page, pageSize],
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
        endpoint: API_ENDPOINTS.OPPORTUNITY_SEARCH(opportunityId),
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
