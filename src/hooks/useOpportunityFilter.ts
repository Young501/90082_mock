import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store";
import { useOpportunityFacets, useOpportunitySearch } from "@/services/filter";
import {
  FacetsResponse,
  OpportunityRequestBody,
  OpportunityFilters,
  OpportunitySort,
  OpportunitySortBy,
} from "@/types/opportunity";

import type { StudentProfile, OrganisationProfile } from "@/types/discovery";

interface UseOpportunityFilterOptions {
  isEnrolled?: boolean;
  isEnrollmentReady?: boolean;
}

// Helper function to build request body with nesting
const buildRequestBody = (
  participantType: string,
  filters: OpportunityFilters,
  query?: string,
  sort?: OpportunitySort
): OpportunityRequestBody => {
  const body: OpportunityRequestBody = {
    participant_type: participantType,
  };

  if (query) {
    body.query = query;
  }

  // Always send a sort; default to distance
  body.sort = sort ?? { by: "distance" };

  if (Object.keys(filters).length > 0) {
    body.filters = filters;
  }

  return body;
};

export const useOpportunityFilter = (
  opportunityId?: string,
  opts: UseOpportunityFilterOptions = {}
) => {
  const { isEnrolled, isEnrollmentReady } = opts;
  const { user } = useAuthStore();

  const [participantType, setParticipantType] = useState<string>("");
  const [filters, setFilters] = useState<OpportunityFilters>({});
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<OpportunitySort>({ by: "distance" });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const userType = user?.user_types?.[0];
  const targetParticipantType = useMemo(() => {
    if (!userType) return "";
    return userType === "student" ? "organisation" : "student";
  }, [userType]);

  useEffect(() => {
    if (targetParticipantType) {
      setParticipantType(targetParticipantType);
    }
  }, [targetParticipantType]);

  const requestBody = useMemo(() => {
    if (!participantType || !isEnrollmentReady || !isEnrolled) {
      return null;
    }
    return buildRequestBody(participantType, filters, query, sort);
  }, [participantType, filters, query, sort, isEnrollmentReady, isEnrolled]);

  const {
    data: facetsData,
    isLoading: isLoadingFacets,
    error: facetsError,
  } = useOpportunityFacets(
    opportunityId && isEnrolled && isEnrollmentReady ? opportunityId : null,
    requestBody
  );

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useOpportunitySearch(
    opportunityId && isEnrolled && isEnrollmentReady ? opportunityId : null,
    requestBody,
    currentPage,
    pageSize
  );

  const handleFilterChange = useCallback(
    (newFilters: OpportunityFilters) => {
      setFilters(newFilters);
      setCurrentPage(1);
    },
    []
  );

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1);
  }, []);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: OpportunitySortBy) => {
    setSort({ by: newSort });
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
    setQuery("");
    setSort({ by: "distance" });
    setCurrentPage(1);
  }, []);

  const totalPages = useMemo(() => {
    const count = searchData?.page.count || 0;
    if (count === 0) return 1;
    return Math.ceil(count / pageSize);
  }, [searchData?.page.count, pageSize]);

  const hasFilters = useMemo(() => {
    // Sort is always applied set to distance)
    return Object.keys(filters).length > 0 || query !== "";
  }, [filters, query]);

  // Extract data with fallbacks
  const facets = facetsData || null;
  const searchResults = searchData?.results || [];
  const resultsCount = searchData?.page.count || 0;
  const hasNext = !!searchData?.page.next;
  const hasPrevious = !!searchData?.page.previous;

  return {
    participantType,
    filters,
    query,
    sort,
    facets,
    searchResults,

    isLoadingFacets,
    isLoadingSearch,
    isLoading: isLoadingFacets || isLoadingSearch,
    error: facetsError || searchError,

    handleFilterChange,
    handlePageChange,
    handlePageSizeChange,
    handleQueryChange,
    handleSortChange,
    handleReset,

    currentPage,
    pageSize,
    totalPages,
    resultsCount,
    hasNext,
    hasPrevious,
    hasFilters,
  };
};
