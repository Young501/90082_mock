"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  VStack,
  Heading,
  Text,
  Card,
  Alert,
  HStack,
  Spinner,
} from "@chakra-ui/react";
import { CheckCircle, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PageTitle } from "@/components/PageTitle";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/authStore";
import { findOpportunityByIdOrSlug } from "@/utils/findOpportunity";

function BillingSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { accessibleOpportunities } = useAuthStore();

  const [context, setContext] = useState<{
    // opportunityId?: string;
    opportunitySlug: string;
    next: string;
  } | null>(null);

  // Load return context from sessionStorage
  useEffect(() => {
    const storedContext = sessionStorage.getItem("billing_return_context");
    console.log("🔍 [Success] Stored context:", storedContext);

    if (storedContext) {
      try {
        const parsed = JSON.parse(storedContext);
        setContext(parsed);
      } catch (e) {
        console.error("❌ [Success] Failed to parse return context:", e);
      }
    } else {
      console.warn("⚠️ [Success] No stored context found");
    }
  }, []);

  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  useEffect(() => {
    if (user?.id) {
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user.id],
      });
    }
  }, [queryClient, user?.id]);

  const handleContinue = () => {
    if (!context) {
      router.push("/dashboard");
      return;
    }

    sessionStorage.removeItem("billing_return_context");

    // const identifier = context.opportunitySlug;
    const currentOpportunity = findOpportunityByIdOrSlug(
      accessibleOpportunities,
      context.opportunitySlug
    );

    if (context.next === "questionnaire") {
      router.push(`/opportunities/start?opp=${context.opportunitySlug}`);
    } else {
      router.push(
        currentOpportunity?.slug
          ? `/discover?opp=${currentOpportunity.slug}`
          : "/discover"
      );
    }
  };

  return (
    <>
      <PageTitle title="Subscription Successful" />
      <Container
        maxW="container.lg"
        py={20}
        mt={{ base: "50px", lg: "100px" }}
        w="fit-content"
      >
        <Card.Root p={8}>
          <Card.Body>
            <VStack gap={6} textAlign="center">
              {/* Success state - always show success since webhook is not merged yet */}
              <Box
                w={20}
                h={20}
                borderRadius="full"
                bg="green.50"
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <CheckCircle size={40} color="#38A169" />
              </Box>

              <VStack gap={2}>
                <Heading size="xl" color="green.600">
                  Payment Successful!
                </Heading>
                <Text color="gray.600" fontSize="lg" maxW="400px">
                  Your payment has been processed successfully, You now have
                  access to all features of this opportunity.
                </Text>
              </VStack>

              <Button
                size="lg"
                w={{ base: "full", md: "300px" }}
                borderRadius="xl"
                _hover={{ bg: "green.700" }}
                onClick={handleContinue}
                mt="30px"
                fontSize="lg"
              >
                {context?.next === "questionnaire"
                  ? "Continue to Questionnaire"
                  : "Explore Opportunity"}
              </Button>

              {sessionId && (
                <Text fontSize="xs" color="gray.400" mt={6}>
                  Session ID: {sessionId}
                </Text>
              )}
            </VStack>
          </Card.Body>
        </Card.Root>
      </Container>
    </>
  );
}

export default function BillingSuccessPage() {
  return (
    <Suspense
      fallback={
        <Container
          maxW="container.lg"
          py={20}
          mt={{ base: "50px", lg: "100px" }}
          w="fit-content"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Spinner size="xl" />
        </Container>
      }
    >
      <BillingSuccessContent />
    </Suspense>
  );
}
