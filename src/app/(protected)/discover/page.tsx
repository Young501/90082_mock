"use client";

import React, { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { Box, VStack, Heading, Text, Separator, Flex, Spinner, Alert, Button, Image } from "@chakra-ui/react";
import { useDiscovery } from "@/hooks/useDiscovery";
import { DiscoveryFilterBox } from "./DiscoveryFilterBox";
import { DiscoveryResultBox } from "./DiscoveryResultBox";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { useSearchParams } from "next/navigation";
import { useOpportunityDetail, useAccessibleOpportunities } from "@/services/shared";
import { Opportunity } from "@/types/invite";
import { QuestionnaireForm, QuestionnaireFormRef } from "@/app/(public)/invite/QuestionnaireForm";
import { useAuthStore } from "@/store";
import Footer from "@/components/Layouts/Footer";

export default function DiscoveryPage() {
  const sp = useSearchParams();
  const idParam = sp.get("id") || undefined;
  const { user } = useAuthStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<Record<string, any>>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const questionnaireRef = useRef<QuestionnaireFormRef>(null);

  // Fetch opportunity details if id is provided
  const { 
    data: opportunity, 
    isLoading: isOpportunityLoading, 
    error: opportunityError 
  } = useOpportunityDetail(idParam || "");

  // Get user's accessible opportunities to check enrollment status
  const { data: accessibleOpportunities } = useAccessibleOpportunities();
  
  // Check if user is enrolled in this opportunity
  const isEnrolled = useMemo(() => {
    if (!idParam || !accessibleOpportunities) return false;
    const currentOpportunity = accessibleOpportunities.find(opp => opp.id.toString() === idParam);
    return currentOpportunity?.status === "Enrolled";
  }, [idParam, accessibleOpportunities]);

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
    opportunityId,
  } = useDiscovery(idParam);

  const { control, watch, getValues } = form;
  const watchedValues = watch();

  // Get questionnaire questions
  const userType = user?.user_types?.[0];
  const questions = useMemo(
    () =>
      userType && opportunity?.questionnaire?.[userType]
        ? opportunity.questionnaire[userType]
        : [],
    [userType, opportunity?.questionnaire]
  );

  const handleQuestionnaireChange = useCallback(
    (answers: Record<string, any>) => {
      setQuestionnaireAnswers(answers);
      if (validationError) {
        setValidationError(null);
      }
    },
    [validationError]
  );

  const handleEnroll = useCallback(async () => {
    if (questions.length > 0 && questionnaireRef.current) {
      const isValid = await questionnaireRef.current.validate();
      if (!isValid) {
        setValidationError("Please fill in all required fields");
        return;
      }
    }

    setValidationError(null);
    
    // TODO: Implement actual enrollment logic
    console.log("Enrolling with answers:", questionnaireAnswers);
    
    // Close modal
    setIsModalOpen(false);
  }, [questionnaireAnswers, questions.length]);

  // If id parameter is provided, show opportunity-specific content
  if (idParam) {
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
                You've discovered the{" "}
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
                      Discover {targetUserType === "student" ? "Organizations" : "Students"}
                    </Heading>
                    <Text color="gray.600">
                      Search and filter{" "}
                      {targetUserType === "student" ? "organizations" : "students"} based on
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
                    opportunityId={opportunityId}
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
                          Join the Employment Opportunity to access part-time, casual, and
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
                        onClick={() => setIsModalOpen(true)}
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
      
        <Footer />

        {/* Questionnaire modal - only show for not enrolled users */}
        {isModalOpen && !isEnrolled && (
          <Box
            position="fixed"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bg="blackAlpha.600"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex={1000}
            onClick={() => setIsModalOpen(false)}
          >
            <Box
              bg="white"
              borderRadius="20px"
              w="90%"
              maxW="600px"
              p={6}
              boxShadow="0px 5.92px 11.84px 5.92px #00000040"
              onClick={(e) => e.stopPropagation()}
              position="relative"
              maxH="80vh"
              overflowY="auto"
            >
              <Button
                position="absolute"
                top={4}
                right={4}
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
              >
                <Image src="/assets/cancel.svg" alt="Close" width={25} height={25} />
              </Button>

              <VStack align="stretch" gap={6} pt={4}>
                <Text
                  fontSize="24px"
                  fontWeight="bold"
                  color="#000000"
                  textAlign="left"
                >
                  Enroll in Opportunity
                </Text>

                {questions.length > 0 ? (
                  <VStack gap={4} align="stretch">
                    <QuestionnaireForm
                      ref={questionnaireRef}
                      questions={questions}
                      onAnswersChange={handleQuestionnaireChange}
                    />
                    
                    {validationError && (
                      <Alert.Root status="error">
                        <Alert.Indicator />
                        <Alert.Title>{validationError}</Alert.Title>
                      </Alert.Root>
                    )}
                    
                    <Flex gap={4} justify="flex-end">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button colorScheme="green" onClick={handleEnroll}>
                        Confirm Enrollment
                      </Button>
                    </Flex>
                  </VStack>
                ) : (
                  <VStack gap={4} align="stretch">
                    <Text>This opportunity doesn't require a questionnaire. Do you want to confirm enrollment?</Text>
                    <Flex gap={4} justify="flex-end">
                      <Button variant="outline" onClick={() => setIsModalOpen(false)}>
                        Cancel
                      </Button>
                      <Button colorScheme="green" onClick={handleEnroll}>
                        Confirm Enrollment
                      </Button>
                    </Flex>
                  </VStack>
                )}
              </VStack>
            </Box>
          </Box>
        )}
      </Box>
    );
  }

  // Default discovery interface when no id is provided
  return (
    <>
      <PageTitle title={PAGE_TITLES.DISCOVER} />
      <Box p={{ base: 4, md: 6 }} maxW="1280px" mx="auto" mt={{ base: "80px", lg: "126px" }} w="100%" overflow="hidden">
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
          opportunityId={opportunityId}
        />
      </Box>
    </>
  );
}
