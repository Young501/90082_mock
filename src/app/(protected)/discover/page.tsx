"use client";

import React, { useEffect, useMemo, useCallback } from "react";
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
} from "@chakra-ui/react";
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

export default function DiscoveryPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id") || undefined;

  const {
    user,
    currentOpportunityId,
    isEnrolled,
    isEligible,
    setCurrentOpportunityId,
    setEnrollmentStatus,
    setEligibilityStatus,
    resetOpportunityState,
  } = useAuthStore();

  // Fetch opportunity details only if id is provided
  const {
    data: opportunity,
    isLoading: isOpportunityLoading,
    error: opportunityError,
  } = useOpportunityDetail(opportunityId || "");

  // Get user's accessible opportunities to check enrollment status
  const { data: accessibleOpportunities, isLoading: isOpportunitiesLoading } =
    useAccessibleOpportunities();

  // Update global state when opportunity changes
  useEffect(() => {
    if (opportunityId !== currentOpportunityId) {
      setCurrentOpportunityId(opportunityId || null);
      // Reset enrollment/eligibility when opportunity changes
      setEnrollmentStatus(null);
      setEligibilityStatus(null);
    }
  }, [
    opportunityId,
    currentOpportunityId,
    setCurrentOpportunityId,
    setEnrollmentStatus,
    setEligibilityStatus,
  ]);

  // Compute and cache enrollment status
  useEffect(() => {
    if (!opportunityId || !accessibleOpportunities) return;

    const currentOpportunity = accessibleOpportunities.find(
      (opp) => opp.id.toString() === opportunityId
    );
    const enrolled = currentOpportunity?.status === "Enrolled";

    if (isEnrolled !== enrolled) {
      setEnrollmentStatus(enrolled);
    }
  }, [opportunityId, accessibleOpportunities, isEnrolled, setEnrollmentStatus]);

  // Compute and cache eligibility status
  useEffect(() => {
    if (!opportunity || !user?.email || isEligible !== null) return;

    const userType = user?.user_types?.[0];
    if (
      userType !== "student" ||
      !opportunity.allowed_student_email_domains?.length
    ) {
      setEligibilityStatus(true); // No restrictions or not a student
      return;
    }

    const eligible = isStudentEligibleForOpportunity(
      user.email,
      opportunity.allowed_student_email_domains
    );
    setEligibilityStatus(eligible);
  }, [
    opportunity,
    user?.email,
    user?.user_types,
    isEligible,
    setEligibilityStatus,
  ]);

  // Auto-redirect logic when no id is provided
  useEffect(() => {
    if (
      !opportunityId &&
      !isOpportunitiesLoading &&
      accessibleOpportunities &&
      accessibleOpportunities.length > 0
    ) {
      const minOpportunity = accessibleOpportunities.reduce((min, current) =>
        current.id < min.id ? current : min
      );
      router.replace(`/discover?id=${minOpportunity.id}`);
    }
  }, [opportunityId, isOpportunitiesLoading, accessibleOpportunities, router]);

  // Discovery hook - only initialize if enrolled
  const isEnrollmentReady =
    !!accessibleOpportunities && !isOpportunitiesLoading;
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
  } = useDiscovery(opportunityId, {
    isEnrolled: isEnrolled === null ? undefined : isEnrolled,
    isEnrollmentReady,
  });

  const { control, watch } = form;
  const watchedValues = watch();

  // Handle enrollment - simplified using global eligibility state
  const handleEnroll = useCallback(() => {
    // Check eligibility from global state (already computed)
    if (isEligible === false) {
      toast.warning("This opportunity is not available for your university.");
      return;
    }

    // Redirect to questionnaire
    router.push(`/opportunities/start?id=${opportunityId}`);
  }, [isEligible, opportunityId, router]);

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

          {/* Enrolled user - show discovery interface */}
          {isEnrolled ? (
            <Box maxW="1280px" mx="auto" w="100%" overflow="hidden">
              <VStack align="stretch" mb={8}>
                <Heading size="lg" color="#282F68">
                  Discover{" "}
                  {targetUserType === "student" ? "Students" : "Partners"}
                </Heading>
                <Text color="gray.600">
                  Search and filter{" "}
                  {targetUserType === "student" ? "students" : "partners"} based
                  on your criteria
                </Text>
              </VStack>

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
                opportunityId={opportunityId}
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
                    h="36px"
                    w={{ base: "full", md: "120px" }}
                    onClick={handleEnroll}
                  >
                    Enroll
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
