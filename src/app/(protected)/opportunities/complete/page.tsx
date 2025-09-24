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
import { useOpportunityDetail } from "@/hooks/useOpportunity";
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

  // Clear saved answers and invalidate cache when component mounts (application completed)
  useEffect(() => {
    clearAnswers();
    
    // Invalidate opportunity cache to ensure fresh data when navigating back
    queryClient.invalidateQueries({
      queryKey: ["opportunity", opportunityId],
    });
    
    // Invalidate accessible opportunities to update enrollment status
    queryClient.invalidateQueries({
      queryKey: ["accessible-opportunities"],
    });
  }, [clearAnswers, queryClient, opportunityId]);

  const handleViewProfile = () => {
    router.push("/profile");
  };

  const handleBackToOpportunity = () => {
    router.push(`/discover?id=${opportunityId}`);
  };

  const handleBackToDashboard = () => {
    router.push("/dashboard");
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
    <Box maxW="700px" mx="auto" p={6} pt={{ base: "90px", lg: "140px" }}>
      <VStack gap={8} align="stretch" textAlign="center">
        {/* Success Icon */}
        <Box>
          <Icon
            as={CheckCircle}
            boxSize={20}
            color="green.500"
            mx="auto"
            mb={6}
          />
        </Box>

        {/* Success Message */}
        <VStack gap={4}>
          <Heading
            fontSize={{ base: "2xl", md: "3xl", lg: "4xl" }}
            fontWeight="700"
            color="gray.900"
          >
            Application Submitted Successfully!
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="500px"
            mx="auto"
            lineHeight="1.6"
          >
            Thank you for applying to{" "}
            <Text as="span" fontWeight="600" color="gray.900">
              {opportunity.title}
            </Text>
            . Your application has been submitted and you will be notified of any updates.
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
              What happens next?
            </Heading>
            <VStack gap={3} align="start" pl={4}>
              <Text fontSize="sm" color="green.800">
                • The opportunity coordinator will review your application
              </Text>
              <Text fontSize="sm" color="green.800">
                • You&apos;ll receive an email notification if you&apos;re selected for the next step
              </Text>
              <Text fontSize="sm" color="green.800">
                • Check your dashboard regularly for updates on your application status
              </Text>
              <Text fontSize="sm" color="green.800">
                • Feel free to apply to other opportunities while you wait
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
              experiences, or certifications to improve your chances in future applications.
            </Text>
          </VStack>
        </Box>

        {/* Action Buttons */}
        <VStack gap={4} pt={4}>
          <HStack gap={4} justify="center" flexWrap="wrap">
            <Button
              onClick={handleViewProfile}
              bg="blue.500"
              color="white"
              _hover={{ bg: "blue.600" }}
              size="lg"
              px={6}
            >
              View My Profile
            </Button>
            <Button
              variant="secondary"
              onClick={handleBackToDashboard}
              size="lg"
              px={6}
            >
              Go to Dashboard
            </Button>
          </HStack>

          <Button
            variant="ghost"
            onClick={handleBackToOpportunity}
            size="sm"
            color="gray.600"
          >
            ← Back to Opportunity Details
          </Button>
        </VStack>

        {/* Footer Note */}
        <Text fontSize="xs" color="gray.500" pt={4}>
          Application submitted on {new Date().toLocaleDateString("en-US", {
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