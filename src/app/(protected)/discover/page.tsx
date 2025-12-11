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
} from "@chakra-ui/react";
import Link from "next/link";
import { LockIcon, FolderHeart } from "lucide-react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { DiscoveryFilterBox } from "./DiscoveryFilterBox";
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

  // useEffect(() => {
  //   setIsUserEligible(null);
  //   setIsEnrolled(null);
  // }, [opportunityId]);

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
    searchResults,
    hasSearched,
    filterableFields,
    filterOptions,
    targetUserType,
    isLoading,
    isSearching,
    form,
    handleSearch,
    handleReset,
    checkDependencies,
    resultsCount,
    showResults,
    currentPage,
    pageSize,
    totalPages,
    handlePageChange,
    handlePageSizeChange,
  } = useDiscovery(opportunityId?.toString() || "", {
    isEnrolled: isEnrolled === null ? undefined : isEnrolled,
    isEnrollmentReady,
  });

  const { control, watch } = form;
  const watchedValues = watch();

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
        <Box
          flex="1"
          px={{ base: 4, md: 8, lg: 16 }}
          mt={{ base: "80px", lg: "126px" }}
          pb={{ base: 8, lg: 12 }}
          w="100%"
          maxW="100vw"
          overflow="hidden"
        >
          {/* Title */}
          <Heading
            as="h1"
            fontSize={{ base: "2xl", md: "4xl" }}
            textAlign="center"
            mt={{ base: 8, md: 12 }}
            mb={{ base: 8, md: 12 }}
            lineHeight="1.3"
          >
            You are exploring the{" "}
            <Box
              as="span"
              bg="blue.600"
              color="white"
              px={4}
              py={2}
              borderRadius="2xl"
              display="inline-block"
            >
              {opportunity.title}
            </Box>{" "}
            opportunity
          </Heading>
          {/* Enrolled user and eligible - show discovery interface */}
          {isEnrolled && accessInfo?.has_access && !isSubmitting ? (
            <Box maxW="1280px" mx="auto" w="100%" overflow="hidden">
              <Flex justify="space-between" align="center" mb={4}>
                <VStack align="stretch">
                  <Heading size="lg" color="#313238ff">
                    Discover{" "}
                    {targetUserType === "student" ? "Students" : "Partners"}
                  </Heading>
                  <Text color="gray.600">
                    Search and filter{" "}
                    {targetUserType === "student" ? "students" : "partners"}{" "}
                    based on your criteria
                  </Text>
                </VStack>
                <Button
                  onClick={() =>
                    router.push(`/folders/?opp=${opportunitySlug}`)
                  }
                  bg="#2CA9DF"
                  borderRadius="15px"
                  px={6}
                  py={5}
                  maxW="200px"
                  // boxShadow="0px 4px 4px 0px #00000040"
                  // h="auto"
                  fontSize="16px"
                  fontWeight="600"
                  display="flex"
                  alignItems="center"
                  gap={4}
                  _hover={{ bg: "#002157" }}
                >
                  <FolderHeart size="60px" color="white" />
                  Folders
                </Button>
              </Flex>
              <Box borderRadius="md" mb={8} w="100%">
                <DiscoveryFilterBox
                  fields={filterableFields}
                  control={control}
                  watchedValues={watchedValues}
                  checkDependencies={checkDependencies}
                  hasSearched={hasSearched}
                  isSearching={isSearching}
                  onSubmit={handleSearch}
                  onReset={handleReset}
                  filterOptions={filterOptions}
                />
              </Box>
              <Separator my={6} />
              <DiscoveryResultBox
                results={searchResults}
                count={resultsCount}
                isLoading={isSearching}
                hasSearched={hasSearched}
                show={showResults}
                userType={targetUserType!}
                currentPage={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                onPageChange={handlePageChange}
                onPageSizeChange={handlePageSizeChange}
                opportunityId={opportunityId?.toString() || ""}
                opportunitySlug={opportunitySlug}
              />
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
        </Box>
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
