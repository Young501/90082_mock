"use client";

import React, { useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Spinner,
  Alert,
  Container,
  Icon,
} from "@chakra-ui/react";
import { Calendar, Building } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail } from "@/services/shared";
import { useAuthStore } from "@/store";
import { isStudentEligibleForOpportunity } from "@/utils/domainEligibility";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/Button";
import ProgressTrack from "@/components/ProgressTrack";

import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";

export default function OpportunityStartPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");
  const { user } = useAuthStore();
  
  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

  const handleStartQuestionnaire = () => {
    // Check domain eligibility for students first
    if (
      user?.user_types?.includes('student') &&
      user?.email &&
      Array.isArray(opportunity?.allowed_student_email_domains) &&
      opportunity.allowed_student_email_domains.length > 0
    ) {
      const isEligible = isStudentEligibleForOpportunity(
        user.email,
        opportunity.allowed_student_email_domains
      );
      
      if (!isEligible) {
        toast.warning("This opportunity is not available for your university.", {
          autoClose: 6000,
          closeButton: true,
        });
        return;
      }
    }

    // If eligible or no restrictions, proceed to questionnaire
    router.push(`/opportunities/fill?id=${opportunityId}`);
  };


  useEffect(() => {
    if (!opportunityId) {
      router.push("/discover");
    }
  }, [opportunityId, router]);

  if (!opportunityId) {
    return null;
  }

  if (isLoading) {
    return (
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="center">
          <Spinner size="xl" color="blue.500" />
          <Text>Loading opportunity details...</Text>
        </VStack>
      </Container>
    );
  }

  if (error) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Alert.Root status="error">
          <Alert.Indicator />
          <Alert.Title>Error loading opportunity</Alert.Title>
          <Alert.Description>
            {error?.message || "Failed to load opportunity details"}
          </Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  if (!opportunity) {
    return (
      <Box maxW="600px" mx="auto" p={6}>
        <Alert.Root status="warning">
          <Alert.Indicator />
          <Alert.Title>Opportunity not found</Alert.Title>
          <Alert.Description>
            The opportunity you&apos;re looking for doesn&apos;t exist or has been removed.
          </Alert.Description>
        </Alert.Root>
      </Box>
    );
  }

  const userType = user?.user_types?.[0];
  const hasQuestionnaire = userType && opportunity.questionnaire?.[userType];

  const handleBack = () => {
    router.push(`/discover?id=${opportunityId}`);
  };

  return (
    <Box maxW="800px" mx="auto" p={6} pt={{ base: "90px", lg: "140px" }}>
      <VStack gap={8} align="stretch">
        {/* Progress Tracker */}
        <ProgressTrack progressPercent={25} totalSteps={4} />
        
        {/* Header */}
        <Box textAlign="center">
          <Heading
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="700"
            color="gray.900"
            mb={4}
          >
            Employment Opportunity Application
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="600px"
            mx="auto"
          >
            Complete the questionnaire below to apply for this employment opportunity. 
            Your responses will help us match you with the most suitable roles.
          </Text>
        </Box>

        {/* Opportunity Details Card */}
        <Box
          bg="white"
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor="gray.200"
          shadow="sm"
        >
          <VStack gap={6} align="start">
            <Box>
              <Heading
                fontSize={{ base: "xl", md: "2xl" }}
                fontWeight="600"
                color="gray.900"
                mb={3}
              >
                {opportunity.title}
              </Heading>
              <Text
                fontSize="md"
                color="gray.700"
                lineHeight="1.6"
              >
                {opportunity.description}
              </Text>
            </Box>

            {/* Opportunity Meta Info */}
            <VStack gap={3} align="start" w="full">
              <HStack gap={3}>
                <Icon as={Calendar} boxSize={5} color="blue.500" />
                <Text fontSize="sm" color="gray.600">
                  <Text as="span" fontWeight="500">Duration:</Text>{" "}
                  {opportunity.start_date} - {opportunity.end_date}
                </Text>
              </HStack>

              <HStack gap={3}>
                <Icon as={Building} boxSize={5} color="blue.500" />
                <Box
                  bg={opportunity.is_active ? "green.100" : "gray.100"}
                  color={opportunity.is_active ? "green.700" : "gray.700"}
                  px={3}
                  py={1}
                  borderRadius="full"
                  fontSize="sm"
                  fontWeight="500"
                >
                  {opportunity.is_active ? "Active" : "Inactive"}
                </Box>
              </HStack>
            </VStack>
          </VStack>
        </Box>

        {/* Instructions Card */}
        <Box
          bg="blue.50"
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor="blue.200"
        >
          <VStack gap={4} align="start">
            <Heading
              fontSize="lg"
              fontWeight="600"
              color="blue.900"
            >
              What to expect:
            </Heading>
            <VStack gap={3} align="start" pl={4}>
              <Text fontSize="sm" color="blue.800">
                • Answer questions about your employment preferences and skills
              </Text>
              <Text fontSize="sm" color="blue.800">
                • Your responses will be saved automatically as you progress
              </Text>
              <Text fontSize="sm" color="blue.800">
                • Review your answers before final submission
              </Text>
              <Text fontSize="sm" color="blue.800">
                • The process typically takes 1-2 minutes to complete
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <HStack gap={4} justify="center" pt={4}>
          <Button
            variant="secondary"
            onClick={() => router.back()}
            size="lg"
            px={8}
          >
            Go Back
          </Button>
          <Button
            onClick={handleStartQuestionnaire}
            size="lg"
            px={8}
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            disabled={!opportunity.is_active}
          >
            Start Questionnaire
          </Button>
        </HStack>

        {!opportunity.is_active && (
          <Alert.Root status="warning" mt={4}>
            <Alert.Indicator />
            <Alert.Description>
              This opportunity is currently inactive. You cannot apply at this time.
            </Alert.Description>
          </Alert.Root>
        )}
      </VStack>
    </Box>
  );
}