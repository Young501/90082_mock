"use client";

import React, { useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Spinner,
  Alert,
  Container,
} from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail } from "@/services/shared";
import { useAuthStore } from "@/store";
import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";

export default function OpportunityStartPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");
  const { user } = useAuthStore();
  
  console.log("🚀 START PAGE - opportunityId:", opportunityId);

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

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

  if (error || !opportunity) {
    return (
      <Container maxW="4xl" py={8}>
        <Alert.Root status="error" borderRadius="lg">
          <Alert.Indicator />
          <Alert.Title>Failed to load opportunity details. Please try again.</Alert.Title>
        </Alert.Root>
      </Container>
    );
  }

  const userType = user?.user_types?.[0];
  const hasQuestionnaire = userType && opportunity.questionnaire?.[userType];

  const handleBegin = () => {
    router.push(`/opportunities/fill?id=${opportunityId}`);
  };

  const handleBack = () => {
    router.push(`/discover?id=${opportunityId}`);
  };

  return (
    <>
      <PageTitle title="Employment Opportunity Questionnaire" />
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="stretch">
          <Box textAlign="center">
            <Heading
              as="h1"
              size="xl"
              mb={4}
              color="gray.800"
              fontWeight="600"
            >
              {opportunity.title}
            </Heading>
            <Text fontSize="lg" color="gray.600" lineHeight="1.6">
              {opportunity.description}
            </Text>
          </Box>

          <Box
            bg="blue.50"
            borderRadius="16px"
            p={8}
            border="1px solid"
            borderColor="blue.200"
          >
            <VStack gap={6} align="center" textAlign="center">
              <Heading as="h2" size="lg" color="gray.800">
                Ready to Apply?
              </Heading>
              
              {hasQuestionnaire ? (
                <Text fontSize="md" color="gray.600" maxW="2xl">
                  Complete the questionnaire to enroll in this opportunity. 
                  Your responses will help us understand your background and 
                  match you with the best possible experience.
                </Text>
              ) : (
                <Text fontSize="md" color="gray.600" maxW="2xl">
                  Click below to enroll in this opportunity. You&apos;ll be able to 
                  connect with other participants and access all opportunity features.
                </Text>
              )}

              <VStack gap={4} w="100%">
                <Button
                  colorScheme="blue"
                  size="lg"
                  onClick={handleBegin}
                  minW="200px"
                  fontSize="md"
                  fontWeight="600"
                >
                  {hasQuestionnaire ? "Begin Questionnaire" : "Enroll Now"}
                </Button>
                
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleBack}
                  minW="200px"
                  fontSize="md"
                >
                  Back to Opportunity
                </Button>
              </VStack>
            </VStack>
          </Box>

          <Box textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.500">
              Questions? Contact the opportunity coordinator for assistance.
            </Text>
          </Box>
        </VStack>
      </Container>
      <Footer />
    </>
  );
}