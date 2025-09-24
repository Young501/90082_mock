"use client";

import React, { useEffect } from "react";
import {
  Box,
  VStack,
  Heading,
  Text,
  Container,
  HStack,
} from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useOpportunityDetail } from "@/services/shared";
import { PageTitle } from "@/components/PageTitle";
import Footer from "@/components/Layouts/Footer";
import { Button } from "@/components/ui";
import { CheckCircle } from "lucide-react";

export default function OpportunityCompletePage() {
  const sp = useSearchParams();
  const router = useRouter();
  const opportunityId = sp.get("id");

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

  const handleViewOpportunity = () => {
    router.push(`/discover?id=${opportunityId}`);
  };

  const handleViewProfile = () => {
    router.push("/profile");
  };

  if (!opportunityId) {
    return null;
  }

  return (
    <>
      <PageTitle title="Application Complete" />
      <Container maxW="4xl" py={8}>
        <VStack gap={8} align="stretch">
          {/* Success Icon and Header */}
          <Box textAlign="center">
            <Box
              display="inline-flex"
              p={4}
              borderRadius="full"
              bg="green.100"
              color="green.600"
              mb={6}
            >
              <CheckCircle size={48} />
            </Box>
            
            <Heading
              as="h1"
              size="xl"
              mb={4}
              color="gray.800"
              fontWeight="600"
            >
              Application Submitted Successfully!
            </Heading>
            
            <Text fontSize="lg" color="gray.600" mb={2}>
              {opportunity?.title || "Loading..."}
            </Text>
            
            <Text fontSize="md" color="gray.500">
              You have successfully enrolled in this opportunity.
            </Text>
          </Box>

          {/* Next Steps */}
          <Box
            bg="blue.50"
            borderRadius="16px"
            p={8}
            border="1px solid"
            borderColor="blue.200"
          >
            <VStack gap={6} align="center" textAlign="center">
              <Heading as="h2" size="lg" color="gray.800">
                What&apos;s Next?
              </Heading>
              
              <VStack gap={3} align="start" maxW="2xl">
                <Text fontSize="md" color="gray.700">
                  • You&apos;ll receive confirmation and next steps via email
                </Text>
                <Text fontSize="md" color="gray.700">
                  • Check your inbox for opportunity updates and announcements
                </Text>
                <Text fontSize="md" color="gray.700">
                  • Access the opportunity from your Discover page to connect with other participants
                </Text>
                <Text fontSize="md" color="gray.700">
                  • Update your profile to maximize your matching potential
                </Text>
              </VStack>

              <HStack gap={4} pt={4}>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleViewOpportunity}
                  minW="180px"
                >
                  View Opportunity
                </Button>
                
                <Button
                  variant="secondary"
                  size="lg"
                  onClick={handleViewProfile}
                  minW="180px"
                >
                  Update Profile
                </Button>
              </HStack>
            </VStack>
          </Box>

          {/* Additional Information */}
          <Box textAlign="center" pt={4}>
            <Text fontSize="sm" color="gray.500">
              Need help? Contact the opportunity coordinator or check our support resources.
            </Text>
          </Box>
        </VStack>
      </Container>
      <Footer />
    </>
  );
}