"use client";

import React, { useEffect, useMemo, useCallback, useState } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Separator,
  Flex,
  Spinner,
  Alert,
  Button,
  Image,
  Icon,
  HStack,
  Portal,
  IconButton,
} from "@chakra-ui/react";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { LockIcon, FolderHeart, X } from "lucide-react";
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
import DiscoveryFolderCard from "./DiscoveryFolderCard";
import { CreateFolderModal } from "./CreateFolderModal";
import type { DiscoveryFolderItem } from "./DiscoveryFolderCard";
import { IconFolder, IconFilter, IconArrowRight } from "@/components/Icons";

export default function DiscoveryPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunitySlug = sp.get("opp") || undefined;

  const { user, setAccessibleOpportunities } = useAuthStore();
  const [isEnrolled, setIsEnrolled] = useState<boolean | null>(null);
  const [isUserEligible, setIsUserEligible] = useState<boolean | null>(null);

  const { data: accessibleOpportunities, isLoading: isOpportunitiesLoading } =
    useAccessibleOpportunities();

  const currentOpportunity = findOpportunityByIdOrSlug(
    accessibleOpportunities,
    opportunitySlug
  );

  const opportunityId = currentOpportunity?.id;

  const {
    data: opportunity,
    isLoading: isOpportunityLoading,
    error: opportunityError,
  } = useOpportunityDetail(opportunityId?.toString() || "");

  const userType = user?.user_types?.[0];
  const [accessInfo, setAccessInfo] = useState<AccessInfo | null>(null);
  const [createFolderModalOpen, setCreateFolderModalOpen] = useState(false);
  const [folderSheetOpen, setFolderSheetOpen] = useState(false);
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);

  const { data: foldersData, isLoading: isLoadingFolders } =
    useFolders(opportunitySlug);
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
    if (accessibleOpportunities) {
      setAccessibleOpportunities(accessibleOpportunities);
    }
  }, [accessibleOpportunities, setAccessibleOpportunities]);

  // Compute and cache enrollment status
  useEffect(() => {
    if (!opportunityId || !accessibleOpportunities) return;

    const currentOpportunity = findOpportunityByIdOrSlug(
      accessibleOpportunities,
      opportunitySlug
    );
    const enrolled = currentOpportunity?.enrollment_status === "enrolled";

    if (enrolled !== isEnrolled) {
      setIsEnrolled(enrolled);
    }
    setAccessInfo(currentOpportunity?.access || null);
  }, [opportunityId, accessibleOpportunities, isEnrolled, opportunitySlug]);

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

  // Discovery hook - only initialize if enrolled
  const isEnrollmentReady =
    !!accessibleOpportunities && !isOpportunitiesLoading;
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
    isEnrolled: isEnrolled === null ? undefined : isEnrolled,
    isEnrollmentReady,
  });

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
          <Flex
            justify="center"
            align="center"
            minH="400px"
            mt={{ base: "80px", lg: "126px" }}
          >
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
            mt={{ base: "80px", lg: "126px" }}
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
        <VStack
          px={{ base: 4, md: 8, lg: 16 }}
          mt={{ base: "80px", lg: "126px" }}
          py={{ base: 8, lg: 12 }}
          w="100%"
          overflow="hidden"
          gap={{ base: 5, lg: 6 }}
        >
          <OpportunityDescriptionCard
            opportunity={opportunity}
            currentOpportunity={currentOpportunity}
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
                  {facetValidationSuccess && (
                    <OpportunityFilters
                      facets={facets}
                      filters={filters}
                      onFilterChange={handleFilterChange}
                      onReset={handleResetV2}
                      hasFilters={hasFilters}
                      isLoading={isLoadingSearch}
                    />
                  )}
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
                      onClick={() => setFilterSheetOpen(true)}
                    >
                      <IconFilter color="#3F3F46" />
                      Filter
                    </Button>
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
            /* Not enrolled user - show enrollment interface */
            <Box maxW="800px" mx="auto" w="100%" overflow="hidden">
              <Flex
                direction={{ base: "column", md: "row" }}
                align="center"
                justify="center"
                gap={{ base: 8, lg: 16 }}
              >
                <Box flexShrink={0}>
                  <Image
                    src="/assets/discoverNothing.png"
                    alt="Discover"
                    width={400}
                    height={300}
                    style={{
                      height: "auto",
                      width: "100%",
                      maxWidth: "300px",
                    }}
                  />
                </Box>
                <VStack align="flex-start" gap={6} maxW="500px" w="100%">
                  <Text fontSize="lg" color="gray.600">
                    {opportunity.description ||
                      "Ready to connect with industry partners seeking university talent? Join the Opportunity to access part-time, casual, and graduate roles within your university community."}
                  </Text>

                  {(opportunity.start_date || opportunity.end_date) && (
                    <VStack align="flex-start" gap={2} w="100%">
                      {opportunity.start_date && (
                        <Text fontSize="sm" color="gray.500">
                          <strong>Start Date:</strong>{" "}
                          {new Date(
                            opportunity.start_date
                          ).toLocaleDateString()}
                        </Text>
                      )}
                      {opportunity.end_date && (
                        <Text fontSize="sm" color="gray.500">
                          <strong>End Date:</strong>{" "}
                          {new Date(opportunity.end_date).toLocaleDateString()}
                        </Text>
                      )}
                    </VStack>
                  )}
                  <Button
                    colorScheme="green"
                    bg="green.600"
                    color="white"
                    _hover={{ bg: "green.700" }}
                    size="lg"
                    borderRadius="xl"
                    h="50px"
                    w={{ base: "full", md: "160px" }}
                    onClick={handleEnroll}
                    loading={isSubmitting}
                    disabled={isSubmitting}
                  >
                    {accessInfo?.next_action === "subscribe" && (
                      <Icon as={LockIcon} />
                    )}
                    {accessInfo?.next_action === "subscribe"
                      ? "Subscribe"
                      : "Enroll"}
                  </Button>
                </VStack>
              </Flex>
            </Box>
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
        mt={{ base: "80px", lg: "126px" }}
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
          <Flex justify="center" align="center" minH="400px">
            <VStack gap={6} align="center" textAlign="center">
              <Image
                src="/assets/discoverNothing.png"
                alt="No opportunities"
                width={300}
                height={200}
                style={{ height: "auto", width: "100%", maxWidth: "200px" }}
              />
              <VStack gap={4} align="center">
                <Heading size="lg" color="#282F68">
                  You haven&apos;t added any opportunities yet.
                </Heading>
                <Text color="gray.600" fontSize="lg" maxW="500px">
                  Please accept an opportunity invitation first, and then
                  you&apos;ll be able to start discovering and connecting with
                  other users.
                </Text>
              </VStack>
            </VStack>
          </Flex>
        ) : null}
      </Box>
    </>
  );
}
