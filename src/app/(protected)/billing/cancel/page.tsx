"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  HStack,
} from "@chakra-ui/react";
import { XCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/PageTitle";
import { useAuthStore } from "@/store/authStore";

export default function BillingCancelPage() {
  const router = useRouter();
  const { accessibleOpportunities } = useAuthStore();
  const [context, setContext] = useState<{
    opportunityId: string;
    next: string;
  } | null>(null);

  // Load return context from sessionStorage
  useEffect(() => {
    const storedContext = sessionStorage.getItem("billing_return_context");
    if (storedContext) {
      try {
        const parsed = JSON.parse(storedContext);
        setContext(parsed);
      } catch (e) {
        console.error("Failed to parse return context:", e);
      }
    }
  }, []);

  const handleRetry = () => {
    if (context?.opportunityId) {
      router.push(`/opportunities/pricing?id=${context.opportunityId}`);
    } else {
      router.push("/dashboard");
    }
  };

  const handleBackToOpportunity = () => {
    // Clear the stored context
    sessionStorage.removeItem("billing_return_context");

    if (context?.opportunityId) {
      const currentOpportunity = accessibleOpportunities?.find(
        (opp) => opp.id.toString() === context.opportunityId
      );
      router.push(
        currentOpportunity?.slug
          ? `/discover?opp=${currentOpportunity.slug}`
          : "/discover"
      );
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <PageTitle title="Subscription Canceled" />
      <Container maxW="container.md" py={20} mt={{ base: "80px", lg: "100px" }}>
        <Card.Root p={8}>
          <Card.Body>
            <VStack gap={6} textAlign="center">
              {/* Cancel Icon */}
              <Box
                w={20}
                h={20}
                borderRadius="full"
                bg="orange.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <XCircle size={40} color="#DD6B20" />
              </Box>

              {/* Heading */}
              <VStack gap={2}>
                <Heading size="xl" color="orange.600">
                  Subscription Canceled
                </Heading>
                <Text color="gray.600" fontSize="lg">
                  Your payment process has been canceled
                </Text>
              </VStack>

              {/* Description */}
              <VStack gap={3} w="100%" maxW="md">
                <Text color="gray.600">
                  No problem! You can return anytime to continue the
                  subscription process.
                </Text>

                {context?.opportunityId && (
                  <Text color="gray.500" fontSize="sm">
                    You can still browse this opportunity, but some features may
                    require a subscription to access.
                  </Text>
                )}
              </VStack>

              {/* Action buttons */}
              <VStack gap={3} w="100%" mt={4}>
                <Button
                  size="lg"
                  w="100%"
                  colorScheme="blue"
                  onClick={handleRetry}
                >
                  Choose Plan Again
                </Button>

                <Button
                  size="lg"
                  w="100%"
                  variant="ghost"
                  onClick={handleBackToOpportunity}
                >
                  {context?.opportunityId
                    ? "Return to Opportunity"
                    : "Return to Dashboard"}
                </Button>
              </VStack>

              {/* Help text */}
              <Text fontSize="sm" color="gray.500" mt={4}>
                If you have any questions, please contact our support team
              </Text>
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </>
  );
}
