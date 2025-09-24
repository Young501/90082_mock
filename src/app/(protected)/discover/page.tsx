"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, VStack, Heading, Text, Separator, Flex, Spinner, Alert, Button, Image } from "@chakra-ui/react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { DiscoveryFilterBox } from "./DiscoveryFilterBox";
import { DiscoveryResultBox } from "./DiscoveryResultBox";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail, useAccessibleOpportunities } from "@/services/shared";
import { Opportunity } from "@/types/invite";
import { useAuthStore } from "@/store";
import Footer from "@/components/Layouts/Footer";
import { toast } from "react-toastify";
import { isStudentEligibleForOpportunity } from "@/utils/domainEligibility";

export default function DiscoveryPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id") || undefined;
  const { user } = useAuthStore();
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});

  // Fetch opportunity details if id is provided
  const { 
    data: opportunity, 
    isLoading: isOpportunityLoading, 
    error: opportunityError 
  } = useOpportunityDetail(opportunityId || "");

  // Get user's accessible opportunities to check enrollment status
  const { data: accessibleOpportunities, isLoading: isOpportunitiesLoading } = useAccessibleOpportunities();
  
  // Check if user is enrolled in this opportunity
  const isEnrolled = useMemo(() => {
    console.log("🔍 Checking enrollment status:");
    console.log("🔍 opportunityId:", opportunityId);
    console.log("🔍 accessibleOpportunities:", accessibleOpportunities);
    
    if (!opportunityId || !accessibleOpportunities) {
      console.log("🔍 No opportunityId or accessibleOpportunities, returning false");
      return false;
    }
    
    const currentOpportunity = accessibleOpportunities.find(opp => opp.id.toString() === opportunityId);
    console.log("🔍 Found current opportunity:", currentOpportunity);
    
    const enrolled = currentOpportunity?.status === "Enrolled";
    console.log("🔍 Is enrolled:", enrolled);
    
    return enrolled;
  }, [opportunityId, accessibleOpportunities]);

  // Auto-redirect logic when no id is provided
  useEffect(() => {
    if (!opportunityId && !isOpportunitiesLoading && accessibleOpportunities) {
      if (accessibleOpportunities.length > 0) {
        // Find the minimum opportunity id
        const minOpportunity = accessibleOpportunities.reduce((min, current) => 
          current.id < min.id ? current : min
        );
        // Redirect to the minimum opportunity id
        router.replace(`/discover?id=${minOpportunity.id}`);
      }
    }
  }, [opportunityId, isOpportunitiesLoading, accessibleOpportunities, router]);

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
    opportunityId: currentOpportunityId,
  } = useDiscovery(opportunityId);

  const { control, watch, getValues } = form;
  const watchedValues = watch();

  // Get questionnaire questions for state management
  const userType = user?.user_types?.[0];
  const questions = useMemo(
    () =>
      userType && opportunity?.questionnaire?.[userType]
        ? opportunity.questionnaire[userType]
        : [],
    [userType, opportunity?.questionnaire]
  );

  // Update questionnaire answers state when questions change
  useEffect(() => {
    if (questions.length > 0) {
      const defaultAnswers = questions.reduce((acc: Record<string, any>, question: any) => {
        switch (question.type) {
          case "multi-select":
          case "tag-select":
            acc[question.field] = [];
            break;
          case "checkbox-group":
            acc[question.field] = question.max_selection === 1 ? "" : [];
            break;
          case "card-select":
            acc[question.field] = question.max_selection === 1 ? "" : [];
            break;
          case "boolean-checkbox":
            acc[question.field] = undefined;
            break;
          case "range":
            acc[question.field] = question.min !== undefined ? question.min : 0;
            break;
          case "number":
            acc[question.field] = undefined;
            break;
          default:
            acc[question.field] = "";
        }
        return acc;
      }, {} as Record<string, any>);
      setQuestionnaireAnswers(defaultAnswers);
    }
  }, [questions]);

  // Handle enrollment with domain eligibility check
  const handleEnroll = useCallback(() => {
    // Check domain eligibility for students first
    if (
      userType === 'student' &&
      user?.email &&
      Array.isArray(opportunity?.allowed_student_email_domains) &&
      opportunity.allowed_student_email_domains.length > 0
    ) {
      const isEligible = isStudentEligibleForOpportunity(
        user.email,
        opportunity.allowed_student_email_domains
      );
      
      if (!isEligible) {
        toast.warn("This opportunity is not available for your university.");
        return;
      }
    }

    // Save questionnaire state for other team to use
    console.log("Enroll clicked - questionnaire state saved:", questionnaireAnswers);
    // No modal or routing - handled by other team
  }, [userType, user?.email, opportunity?.allowed_student_email_domains, questionnaireAnswers]);

  // If opportunity id parameter is provided, show opportunity-specific content
  if (opportunityId) {
    return (
      <Box display="flex" flexDirection="column" minH="100vh" position="relative" overflow="hidden">
        <PageTitle title={PAGE_TITLES.DISCOVER} />
        

        {/* Main content */}
        <Box
          flex="1"
          px={{ base: 4, md: 8, lg: 16 }}
          mt={{ base: "80px", lg: "126px" }}
          pb={{ base: 8, lg: 12 }}
          w="100%"
          maxW="100vw"
          overflow="hidden"
        >
          {/* Loading state */}
          {isOpportunityLoading && (
            <Flex justify="center" align="center" minH="400px">
              <VStack gap={4} align="center">
                <Spinner size="xl" color="blue.500" />
                <Text>Loading opportunity details...</Text>
              </VStack>
            </Flex>
          )}

          {/* Error state */}
          {opportunityError && (
            <Alert.Root status="error" mb={8}>
              <Alert.Indicator />
              <Alert.Title>Unable to load opportunity details. Please try again later.</Alert.Title>
            </Alert.Root>
          )}

          {/* Content display */}
          {!isOpportunityLoading && !opportunityError && opportunity && (
            <>
              {/* Title */}
              <Heading
                as="h1"
                fontSize={{ base: "2xl", md: "4xl" }}
                textAlign="center"
                mt={{ base: 8, md: 12 }}
                mb={{ base: 8, md: 20 }}
                lineHeight="1.3"
              >
                You&apos;ve discovered the{" "}
                <Box
                  as="span"
                  bg="blue.600"
                  color="white"
                  px={4}
                  py={2}
                  borderRadius="full"
                  display="inline-block"
                >
                  {opportunity.title}
                </Box>{" "}
                opportunity
              </Heading>

              {/* Show different content based on enrollment status */}
              {isEnrolled ? (
                // Enrolled user - show discovery interface
                <Box maxW="1280px" mx="auto" w="100%" overflow="hidden">
                  <VStack align="stretch" mb={8}>
                  <Heading size="lg" color="#282F68">
            Discover {targetUserType === "student" ? "Students" : "Partners"}
          </Heading>
          <Text color="gray.600">
            Search and filter{" "}
            {targetUserType === "student" ? "students" : "partners"} based on
            your criteria
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
                    opportunityId={currentOpportunityId}
                  />
                </Box>
              ) : (
                // Not enrolled user - show enrollment interface
                <Box maxW="600px" mx="auto" w="100%" overflow="hidden">
                  <Flex
                    direction={{ base: "column", md: "row" }}
                    align="center"
                    justify="center"
                    gap={{ base: 8, lg: 16 }}
                  >
                    {/* Image */}
                    <Box flexShrink={0}>
                      <Image
                        src="/assets/discoverNothing.png" 
                        alt="Discover"
                        width={400}
                        height={300}
                        style={{ height: "auto", width: "100%", maxWidth: "200px" }}
                      />
                    </Box>

                    {/* Text and button */}
                    <VStack
                      align="flex-start"
                      gap={6}
                      maxW="560px"
                      w="100%"
                    >
                      {/* Opportunity description */}
                      {opportunity.description && (
                        <Text fontSize="lg" color="gray.600">
                          {opportunity.description}
                        </Text>
                      )}
                      
                      {/* Default description (if no opportunity description) */}
                      {!opportunity.description && (
                        <Text fontSize="lg" color="gray.600">
                          Ready to connect with industry partners seeking university talent?
                          Join the Opportunity to access part-time, casual, and
                          graduate roles within your university community.
                        </Text>
                      )}

                      {/* Opportunity date information */}
                      <VStack align="flex-start" gap={2} w="100%">
                        {opportunity.start_date && (
                          <Text fontSize="sm" color="gray.500">
                            <strong>Start Date:</strong> {new Date(opportunity.start_date).toLocaleDateString()}
                          </Text>
                        )}
                        {opportunity.end_date && (
                          <Text fontSize="sm" color="gray.500">
                            <strong>End Date:</strong> {new Date(opportunity.end_date).toLocaleDateString()}
                          </Text>
                        )}
                      </VStack>
                      
                      {/* Enrollment button */}
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
            </>
          )}
        </Box>
      </Box>
    );
  }

  // Default discovery interface when no id is provided
  return (
    <>
      <PageTitle title={PAGE_TITLES.DISCOVER} />
      <Box p={{ base: 4, md: 6 }} maxW="1280px" mx="auto" mt={{ base: "80px", lg: "126px" }} w="100%" overflow="hidden">
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
                Please accept an opportunity invitation first, and then you&apos;ll be able to start discovering and connecting with other users.
                </Text>
              </VStack>
            </VStack>
          </Flex>
        ) : (
          // Default discovery interface (this should not be reached due to auto-redirect)
          <VStack align="stretch" mb={8}>
            <Heading size="lg" color="#282F68">
              Discover {targetUserType === "student" ? "Students" : "Partners"}
            </Heading>
            <Text color="gray.600">
              Search and filter{" "}
              {targetUserType === "student" ? "students" : "partners"} based on
              your criteria
            </Text>
          </VStack>
        )}
      </Box>
    </>
  );
}
