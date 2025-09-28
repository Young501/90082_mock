"use client";

import React, { useEffect } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
} from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import ProgressTrack from "@/components/ProgressTrack";

export default function OpportunityStartPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");

  const handleStartQuestionnaire = () => {
    // Proceed directly to questionnaire (domain check handled in discover page)
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
            Employment Opportunity Enrollment
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="600px"
            mx="auto"
          >
            Complete the questionnaire below to enroll in this employment opportunity. 
            Your responses will help us match you with the most suitable roles.
          </Text>
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
          >
            Start Questionnaire
          </Button>
        </HStack>
      </VStack>
    </Box>
  );
}