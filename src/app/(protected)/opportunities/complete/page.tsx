"use client";

import React, { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,
  Alert,
  Icon,
  HStack,
} from "@chakra-ui/react";
import { CheckCircle, Loader } from "lucide-react";
import { Button } from "@/components/ui/Button";
import ProgressTrack from "@/components/ProgressTrack";
import { useOpportunityDetail } from "@/services/shared";
import { useAuthStore } from "@/store";
import { Question } from "@/types/onboarding";
import { useQuestionnaireAnswers } from "@/hooks/useQuestionnaireAnswers";

import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";

export default function OpportunityCompletePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  if (!opportunityId) {
    router.push('/opportunities');
    return null;
  }

  const { clearAnswers } = useQuestionnaireAnswers(opportunityId);

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId);

  // Clear saved answers and invalidate cache when component mounts (enrollment completed)
  useEffect(() => {
    clearAnswers();
    
    // Invalidate opportunity cache to ensure fresh data when navigating back
    queryClient.invalidateQueries({
      queryKey: ["opportunity", opportunityId],
    });
    
    // Invalidate accessible opportunities to update enrollment status
    queryClient.invalidateQueries({
      queryKey: ["accessible-opportunities", user?.id],
    });
  }, [clearAnswers, queryClient, opportunityId, user?.id]);

  const handleBackToOpportunity = () => {
    router.push(`/discover?id=${opportunityId}`);
  };

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minH="60vh"
      >
        <Loader />
      </Box>
    );
  }

  if (error) {
    return (
      <Box maxW="800px" mx="auto" p={6}>
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
      <Box maxW="800px" mx="auto" p={6}>
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

  return (
    <Box maxW="800px" mx="auto" p={6} pt={{ base: "90px", lg: "140px" }}>
      <VStack gap={8} align="stretch">
        {/* Progress Tracker */}
        <ProgressTrack progressPercent={100} totalSteps={4} />
        
        {/* Success Icon */}
        <Box textAlign="center">
          <Icon
            as={CheckCircle}
            boxSize={20}
            color="green.500"
            mx="auto"
            mb={6}
          />
        </Box>

        {/* Success Message */}
        <VStack gap={4} textAlign="center">
          <Heading
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="700"
            color="gray.900"
          >
            Successfully Enrolled!
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="500px"
            mx="auto"
            lineHeight="1.6"
          >
            Congratulations! You are now enrolled in{" "}
            <Text as="span" fontWeight="600" color="gray.900">
              {opportunity.title}
            </Text>
            . You can explore the opportunity details and get started right away.
          </Text>
        </VStack>

        {/* Success Details Card */}
        <Box
          bg="green.50"
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor="green.200"
        >
          <VStack gap={4} align="start" textAlign="left">
            <Heading
              fontSize="lg"
              fontWeight="600"
              color="green.900"
            >
              You&apos;re all set!
            </Heading>
            <VStack gap={3} align="start" pl={4}>
              <Text fontSize="sm" color="green.800">
                • You are now officially enrolled in this opportunity
              </Text>
              <Text fontSize="sm" color="green.800">
                • The opportunity coordinator will be in touch with next steps
              </Text>
              <Text fontSize="sm" color="green.800">
                • You can explore the opportunity details anytime
              </Text>
              <Text fontSize="sm" color="green.800">
                • Feel free to enroll in other opportunities as well
              </Text>
            </VStack>
          </VStack>
        </Box>

        {/* Information Card */}
        <Box
          bg="blue.50"
          borderRadius="16px"
          p={{ base: 6, md: 8 }}
          border="1px solid"
          borderColor="blue.200"
        >
          <VStack gap={4} align="start" textAlign="left">
            <Heading
              fontSize="lg"
              fontWeight="600"
              color="blue.900"
            >
              Keep improving your profile
            </Heading>
            <Text fontSize="sm" color="blue.800">
              While you wait for a response, consider updating your profile with more skills, 
              experiences, or certifications to improve your chances in future opportunities.
            </Text>
          </VStack>
        </Box>

        {/* Action Button */}
        <Box textAlign="center" pt={4}>
          <Button
            onClick={handleBackToOpportunity}
            bg="blue.500"
            color="white"
            _hover={{ bg: "blue.600" }}
            size="lg"
            px={8}
          >
            Explore the Opportunity
          </Button>
        </Box>

        {/* Footer Note */}
        <Text fontSize="xs" color="gray.500" pt={4} textAlign="center">
          Enrolled on {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </VStack>
    </Box>
  );
}