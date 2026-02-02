import { useState, useEffect, useCallback, useMemo } from "react";
import { useAuthStore } from "@/store";
import { useDiscoveryFacets, useDiscoverySearch } from "@/services/user";
import {
  FacetsResponse,
  DiscoveryRequestBody,
  DiscoveryFilters,
  StudentProfile,
  OrganisationProfile,
} from "@/types/discovery";

interface UseDiscoveryV2Options {
  isEnrolled?: boolean;
  isEnrollmentReady?: boolean;
}

// Helper function to build request body with nesting
const buildRequestBody = (
  participantType: string,
  filters: DiscoveryFilters,
  query?: string,
  sort?: string
): DiscoveryRequestBody => {
  const body: DiscoveryRequestBody = {
    participant_type: participantType,
  };

  if (query) {
    body.query = query;
  }

  if (sort) {
    body.sort = sort;
  }

  if (Object.keys(filters).length > 0) {
    body.filters = filters;
  }

  return body;
};

export const useDiscoveryV2 = (
  opportunityId?: string,
  opts: UseDiscoveryV2Options = {}
) => {
  const { isEnrolled, isEnrollmentReady } = opts;
  const { user } = useAuthStore();

  const [participantType, setParticipantType] = useState<string>("");
  const [filters, setFilters] = useState<DiscoveryFilters>({});
  const [query, setQuery] = useState<string>("");
  const [sort, setSort] = useState<string>("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);

  const userType = user?.user_types?.[0];
  const targetParticipantType = useMemo(() => {
    if (!userType) return "";
    return userType === "student" ? "organisation" : "student";
  }, [userType]);

  console.log("targetParticipantType", targetParticipantType);

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
  } = useDiscoveryFacets(
    opportunityId && isEnrolled && isEnrollmentReady ? opportunityId : null,
    requestBody
  );

  const {
    data: searchData,
    isLoading: isLoadingSearch,
    error: searchError,
  } = useDiscoverySearch(
    opportunityId && isEnrolled && isEnrollmentReady ? opportunityId : null,
    requestBody,
    currentPage,
    pageSize
  );

  const handleFilterChange = useCallback(
    (newFilters: DiscoveryFilters) => {
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

  const handleSortChange = useCallback((newSort: string) => {
    setSort(newSort);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({});
    setQuery("");
    setSort("");
    setCurrentPage(1);
  }, []);

  const totalPages = useMemo(() => {
    const count = searchData?.page.count || 0;
    if (count === 0) return 1;
    return Math.ceil(count / pageSize);
  }, [searchData?.page.count, pageSize]);

  // Check if any filters are applied
  const hasFilters = useMemo(() => {
    return Object.keys(filters).length > 0 || query !== "" || sort !== "";
  }, [filters, query, sort]);

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
