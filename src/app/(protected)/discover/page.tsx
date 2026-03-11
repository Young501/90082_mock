"use client";

import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  Box,
  VStack,
  Text,
  Flex,
  Spinner,
  Alert,
  Button,
  HStack,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { MessageCircleX } from "lucide-react";
import { useOpportunityFilter } from "@/hooks/useOpportunityFilter";
import { OpportunityFilters } from "./OpportunityFilters";
import { DiscoveryResultBox } from "./DiscoveryResultBox";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { useSearchParams, useRouter } from "next/navigation";
import {
  useOpportunityDetail,
  useAccessibleOpportunities,
} from "@/services/shared";
import { useAuthStore } from "@/store";
import { toast } from "react-toastify";
import { isStudentEligibleForOpportunity } from "@/utils/domainEligibility";
import { useHandleEnroll } from "@/hooks/useHandleEnroll";
import { AccessInfo } from "@/types/opportunities";
import { findOpportunityByIdOrSlug } from "@/utils/findOpportunity";
import { useFolders } from "@/services/folder";
import { OpportunityDescriptionCard } from "./cards/OpportunityDescriptionCard";
import { OpportunityNotEnrolledCard } from "./cards/OpportunityNotEnrolledCard";
import DiscoveryFolderCard from "./DiscoveryFolderCard";
import { CreateFolderModal } from "./CreateFolderModal";
import type { DiscoveryFolderItem } from "./DiscoveryFolderCard";
import { IconFolder, IconArrowRight } from "@/components/Icons";
import { FilterButton } from "@/components/ui/FilterButton";

export default function DiscoveryPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunitySlug = sp.get("opp") || undefined;

  const { user } = useAuthStore();
  const [isUserEligible, setIsUserEligible] = useState<boolean | null>(null);

  const { data: accessibleOpportunities, isLoading: isOpportunitiesLoading } =
    useAccessibleOpportunities();

  const currentOpportunity = findOpportunityByIdOrSlug(
    accessibleOpportunities,
    opportunitySlug
  );

  const opportunityId = currentOpportunity?.id;
  const isEnrollmentReady =
    !!accessibleOpportunities && !isOpportunitiesLoading;
  const isEnrolled =
    isEnrollmentReady && currentOpportunity
      ? currentOpportunity.enrollment_status === "enrolled"
      : undefined;
  const accessInfo = currentOpportunity?.access ?? null;

  const {
    data: opportunity,
    isLoading: isOpportunityLoading,
    error: opportunityError,
  } = useOpportunityDetail(opportunityId?.toString() || "");

  const userType = user?.user_types?.[0];
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const { data: foldersData, isLoading: isLoadingFolders } = useFolders(
    opportunitySlug,
    { enabled: isEnrolled === true }
  );
  const discoveryFolders: DiscoveryFolderItem[] = useMemo(
    () =>
      (foldersData ?? []).map((f) => ({
        id: String(f.id),
        name: f.name,
        count: f.member_count,
      })),
    [foldersData]
  );
  const handleFolderClick = useCallback(
    (folder: DiscoveryFolderItem) => {
      const oppParam = opportunitySlug ? `&opp=${opportunitySlug}` : "";
      router.push(`/folders?id=${folder.id}${oppParam}`);
    },
    [opportunitySlug, router]
  );

  useEffect(() => {
    if (!opportunity || !user?.email || isUserEligible !== null) return;

    const userType = user?.user_types?.[0];
    if (
      userType !== "student" ||
      !opportunity.allowed_student_email_domains?.length
    ) {
      setIsUserEligible(true);
      return;
    }

    const eligible = isStudentEligibleForOpportunity(
      user.email,
      opportunity.allowed_student_email_domains
    );
    setIsUserEligible(eligible);
  }, [opportunity, user?.email, user?.user_types, isUserEligible]);

  // Auto-redirect logic when no id is provided
  useEffect(() => {
    if (
      !opportunitySlug &&
      !isOpportunitiesLoading &&
      accessibleOpportunities &&
      accessibleOpportunities.length > 0
    ) {
      const minOpportunity = accessibleOpportunities.reduce((min, current) =>
        current.id < min.id ? current : min
      );
      router.replace(`/discover?opp=${minOpportunity.slug}`);
    }
  }, [
    opportunitySlug,
    isOpportunitiesLoading,
    accessibleOpportunities,
    router,
  ]);

  const isEligible = isUserEligible ?? false;

  const {
    participantType,
    filters,
    query,
    sort,
    facets,
    searchResults,
    currentPage,
    pageSize,
    hasNext,
    hasPrevious,
    isLoadingFacets,
    isLoadingSearch,
    isLoading: isLoadingV2,
    handleFilterChange,
    handlePageChange: handlePageChangeV2,
    handlePageSizeChange: handlePageSizeChangeV2,
    handleQueryChange,
    handleSortChange,
    handleReset: handleResetV2,
    totalPages: totalPagesV2,
    hasFilters,
    resultsCount: resultsCountV2,
  } = useOpportunityFilter(opportunityId?.toString() || "", {
    isEnrolled,
    isEnrollmentReady,
  });

  useEffect(() => {
    if (!sort?.by) {
      handleSortChange("distance");
    }
  }, [sort?.by, handleSortChange]);

  const facetValidationSuccess = useMemo(() => {
    const hasOnboardingWithCounts = Object.keys(
      facets?.facets?.onboarding || {}
    ).some((key) =>
      facets?.facets?.onboarding?.[key]?.options?.some(
        (option: { count: number }) => option.count > 0
      )
    );
    const hasQuestionnaireWithCounts = Object.keys(
      facets?.facets?.questionnaire || {}
    ).some((key) =>
      facets?.facets?.questionnaire?.[key]?.options?.some(
        (option: { count: number }) => option.count > 0
      )
    );

    const hasAnyFacets = hasOnboardingWithCounts || hasQuestionnaireWithCounts;

    if (hasAnyFacets || isLoadingSearch) {
      return true;
    }

    return false;
  }, [facets, isLoadingSearch]);

  console.log("facetValidationSuccess", facetValidationSuccess);

  const { handleEnroll, isSubmitting } = useHandleEnroll({
    isEligible,
    opportunityId: opportunityId?.toString() || "",
    opportunity,
    accessInfo,
    toast,
    opportunitySlug,
  });

  // Opportunity-specific content
  if (opportunityId) {
    // Loading state
    if (isOpportunityLoading) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          position="relative"
          overflow="hidden"
        >
          <PageTitle title={PAGE_TITLES.DISCOVER} />
          <Flex justify="center" align="center" minH="400px">
            <VStack gap={4} align="center">
              <Spinner size="xl" color="blue.500" />
              <Text>Loading opportunity details...</Text>
            </VStack>
          </Flex>
        </Box>
      );
    }

    // Error state
    if (opportunityError || !opportunity) {
      return (
        <Box
          display="flex"
          flexDirection="column"
          position="relative"
          overflow="hidden"
        >
          <PageTitle title={PAGE_TITLES.DISCOVER} />
          <Box
            px={{ base: 4, md: 8, lg: 16 }}
            // mt={{ base: "80px", lg: "126px" }}
          >
            <Alert.Root status="error" mb={8}>
              <Alert.Indicator />
              <Alert.Title>
                Unable to load opportunity details. Please try again later.
              </Alert.Title>
            </Alert.Root>
          </Box>
        </Box>
      );
    }

    // Main content - opportunity exists
    return (
      <Box
        display="flex"
        flexDirection="column"
        position="relative"
        overflow="hidden"
      >
        <PageTitle title={PAGE_TITLES.DISCOVER} />
        <VStack w="100%" overflow="hidden" gap={{ base: 5, lg: 6 }}>
          <OpportunityDescriptionCard
            opportunity={opportunity}
            currentOpportunity={currentOpportunity}
            userType={userType}
          />
          {/* Enrolled user and eligible - show discovery interface */}
          {isEnrolled && accessInfo?.has_access && !isSubmitting ? (
            <Box w="100%" overflow="hidden">
              <Box
                display="flex"
                flexDirection={{ base: "column", lg: "row" }}
                gap={8}
                alignItems="start"
                justifyContent="start"
                w="100%"
              >
                <Box
                  display={{ base: "none", lg: "flex" }}
                  flexDirection="column"
                  gap={5}
                >
                  {/* {facetValidationSuccess && ( */}
                  <OpportunityFilters
                    facets={facets}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                    onReset={handleResetV2}
                    hasFilters={hasFilters}
                    isLoading={isLoadingSearch}
                    facetValidationSuccess={facetValidationSuccess}
                  />
                  {/* )} */}
                  <DiscoveryFolderCard
                    folders={discoveryFolders}
                    isLoading={isLoadingFolders}
                    onCreateNewFolder={() => setCreateFolderModalOpen(true)}
                    onFolderClick={handleFolderClick}
                  />
                </Box>

                <HStack
                  display={{ base: "flex", lg: "none" }}
                  w="100%"
                  gap={3}
                  flexShrink={0}
                >
                  <Button
                    variant="outline"
                    flex={1}
                    justifyContent="flex-start"
                    gap={2}
                    py="14px"
                    px={4}
                    borderRadius="xl"
                    borderColor="#E4E4E7"
                    borderWidth="1px"
                    bg="white"
                    color="#27272A"
                    fontWeight="normal"
                    fontSize="md"
                    onClick={() => setFolderSheetOpen(true)}
                  >
                    <IconFolder color="#3F3F46" />
                    My Folder
                    <Box ml="auto">
                      <ChevronRight size={20} color="#3F3F46" />
                    </Box>
                  </Button>
                  {facetValidationSuccess && (
                    <FilterButton
                      flex={1}
                      label="Filter"
                      onClick={() => setFilterSheetOpen(true)}
                    />
                  )}
                </HStack>

                {folderSheetOpen && (
                  <Portal>
                    <Box
                      position="fixed"
                      inset={0}
                      bg="blackAlpha.600"
                      boxShadow="0px 4px 6px -4px #0000001A"
                      zIndex={9998}
                      onClick={() => setFolderSheetOpen(false)}
                    />
                    <Box
                      position="fixed"
                      bottom={4}
                      left={4}
                      right={4}
                      maxH="85vh"
                      overflowY="auto"
                      bg="white"
                      borderRadius="10px"
                      zIndex={9999}
                    >
                      <DiscoveryFolderCard
                        inDrawer
                        folders={discoveryFolders}
                        isLoading={isLoadingFolders}
                        onCreateNewFolder={() => {
                          setFolderSheetOpen(false);
                          setCreateFolderModalOpen(true);
                        }}
                        onFolderClick={(folder) => {
                          handleFolderClick(folder);
                          setFolderSheetOpen(false);
                        }}
                        onClose={() => setFolderSheetOpen(false)}
                      />
                    </Box>
                  </Portal>
                )}

                {filterSheetOpen && (
                  <Portal>
                    <Box
                      position="fixed"
                      inset={0}
                      bg="blackAlpha.600"
                      boxShadow="0px 4px 6px -4px #0000001A"
                      zIndex={9998}
                      onClick={() => setFilterSheetOpen(false)}
                    />
                    <Box
                      position="fixed"
                      bottom={4}
                      left={4}
                      right={4}
                      maxH="85vh"
                      overflowY="auto"
                      bg="white"
                      borderRadius="10px"
                      zIndex={9999}
                    >
                      <OpportunityFilters
                        inDrawer
                        facets={facets}
                        filters={filters}
                        onFilterChange={handleFilterChange}
                        onReset={handleResetV2}
                        hasFilters={hasFilters}
                        isLoading={isLoadingSearch}
                        onApply={() => setFilterSheetOpen(false)}
                        onClose={() => setFilterSheetOpen(false)}
                      />
                    </Box>
                  </Portal>
                )}

                {opportunitySlug && (
                  <CreateFolderModal
                    isOpen={createFolderModalOpen}
                    onClose={() => setCreateFolderModalOpen(false)}
                    opportunitySlug={opportunitySlug}
                    onSuccess={() => setCreateFolderModalOpen(false)}
                  />
                )}

                <DiscoveryResultBox
                  results={searchResults}
                  isLoading={isLoadingSearch}
                  hasSearched={hasFilters}
                  show={
                    searchResults.length > 0 || hasFilters || isLoadingSearch
                  }
                  userType={participantType!}
                  query={query ?? ""}
                  onQueryChange={handleQueryChange}
                  sortBy={sort?.by ?? undefined}
                  onSortChange={handleSortChange}
                  pagination={{
                    currentPage,
                    totalPages: totalPagesV2,
                    pageSize,
                    count: resultsCountV2,
                    hasNext,
                    hasPrevious,
                    onPageChange: handlePageChangeV2,
                    onPageSizeChange: handlePageSizeChangeV2,
                  }}
                  opportunityId={opportunityId?.toString() || ""}
                  opportunitySlug={opportunitySlug}
                />
              </Box>
            </Box>
          ) : (
            <OpportunityNotEnrolledCard
              opportunity={opportunity}
              accessInfo={accessInfo}
              onEnroll={handleEnroll}
              isSubmitting={isSubmitting}
            />
          )}
        </VStack>
      </Box>
    );
  }

  // Default discovery interface when no id is provided
  return (
    <>
      <PageTitle title={PAGE_TITLES.DISCOVER} />
      <Box
        p={{ base: 4, md: 6 }}
        maxW="1280px"
        mx="auto"
        w="100%"
        overflow="hidden"
      >
        {/* Loading state while checking opportunities */}
        {isOpportunitiesLoading ? (
          <Flex justify="center" align="center" minH="400px">
            <VStack gap={4} align="center">
              <Spinner size="xl" color="blue.500" />
              <Text>Loading opportunities...</Text>
            </VStack>
          </Flex>
        ) : !accessibleOpportunities || accessibleOpportunities.length === 0 ? (
          // No opportunities available
          <Flex
            justify="center"
            align="center"
            h="100%"
            // minH="400px"
            minH="calc(100vh - 200px)"
          >
            <VStack
              h="100%"
              align="center"
              justify="center"
              gap={6}
              w="100%"
              maxW="374px"
              mx="auto"
              my="auto"
            >
              <Box display="flex" alignItems="center" justifyContent="center">
                <MessageCircleX size={64} color="#52525B" />
              </Box>
              <Text fontWeight="semibold" fontSize="xl">
                No opportunities found yet
              </Text>
              <Text
                fontSize="lg"
                color="#52525B"
                textAlign="center"
                maxW="310px"
              >
                No opportunities found. Please check back later.
              </Text>
            </VStack>
          </Flex>
        ) : null}
      </Box>
    </>
  );
}
