"use client";

import React, { useEffect } from "react";
import { Box, VStack, HStack, Stack, Heading, Text } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import ProgressTrack from "@/components/ProgressTrack";
import { useOpportunityDetail } from "@/services/shared";

export default function OpportunityStartPage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");

  const {
    data: opportunity,
    isLoading,
    error,
  } = useOpportunityDetail(opportunityId || "");

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
      <VStack gap={8} w="100%" align="stretch">
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
            {opportunity?.title} Enrollment
          </Heading>
          <Text
            fontSize={{ base: "md", md: "lg" }}
            color="gray.600"
            maxW="600px"
            mx="auto"
          >
            Complete the questionnaire below to enroll in this opportunity. Your
            responses will help us find your most suitable matches.
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
            <Heading fontSize="lg" fontWeight="600" color="blue.900">
              What to expect:
            </Heading>
            <VStack gap={3} align="start" pl={4}>
              <Text fontSize="sm" color="blue.800">
                • Answer questions about your preferences and skills
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
        <Stack
          direction={{ base: "column", md: "row" }}
          justify={{ base: "stretch", md: "space-between" }}
          align="stretch"
          w="100%"
          pt={0}
          pb={4}
        >
          <Button
            variant="secondary"
            onClick={() => router.push("/discover/?id=" + opportunityId)}
            size="lg"
            borderRadius="xl"
            h="50px"
            w="100%"
            maxW={{ base: "100%", md: "350px" }}
            fontSize="md"
          >
            Cancel
          </Button>
          <Button
            onClick={handleStartQuestionnaire}
            size="lg"
            bg="blue.500"
            color="white"
            borderRadius="xl"
            h="50px"
            w="100%"
            maxW={{ base: "100%", md: "350px" }}
            fontSize="md"
            _hover={{ bg: "blue.600" }}
          >
            Start
          </Button>
        </Stack>
      </VStack>
    </Box>
  );
}
