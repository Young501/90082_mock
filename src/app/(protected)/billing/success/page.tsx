"use client";

import React, { useEffect, useState } from "react";
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
} from "@chakra-ui/react";
import { CheckCircle, Loader, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useSubscriptionStatus } from "@/services/billing";
import { PageTitle } from "@/components/PageTitle";

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [context, setContext] = useState<{
    opportunityId: string;
    next: string;
  } | null>(null);
  const [participantId, setParticipantId] = useState<string | null>(null);
  const [checkAttempts, setCheckAttempts] = useState(0);
  const maxAttempts = 10; // Maximum polling attempts

  // Load return context from sessionStorage
  useEffect(() => {
    const storedContext = sessionStorage.getItem("billing_return_context");

    if (storedContext) {
      try {
        const parsed = JSON.parse(storedContext);
        setContext(parsed);

        // Try to get participant ID from localStorage or another source
        const oppParticipantId = sessionStorage.getItem(
          `opportunity_participant_${parsed.opportunityId}`
        );

        if (oppParticipantId) {
          setParticipantId(oppParticipantId);
        }
      } catch (e) {
        console.error("❌ [Success] Failed to parse return context:", e);
      }
    }
  }, []);

  // Poll subscription status
  const {
    data: subscriptionStatus,
    isLoading,
    refetch,
  } = useSubscriptionStatus(participantId);

  // Check if subscription is ready
  const isSubscriptionReady =
    subscriptionStatus?.status === "active" ||
    subscriptionStatus?.status === "trialing";

  // Auto-refetch status every 2 seconds for up to maxAttempts times
  useEffect(() => {
    if (participantId && checkAttempts < maxAttempts) {
      console.log(
        `🔄 [Success] Polling subscription status (attempt ${checkAttempts + 1}/${maxAttempts}) for participant:`,
        participantId
      );
      const interval = setInterval(() => {
        console.log(`🔄 [Success] Refetching status...`);
        refetch();
        setCheckAttempts((prev) => prev + 1);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [participantId, checkAttempts, refetch]);

  // Log subscription status when it updates
  useEffect(() => {
    if (subscriptionStatus) {
      console.log(
        "📊 [Success] Subscription status updated:",
        subscriptionStatus
      );
      console.log("✨ [Success] Is ready:", isSubscriptionReady);
    }
  }, [subscriptionStatus, isSubscriptionReady]);

  const handleContinue = () => {
    if (!context) {
      router.push("/dashboard");
      return;
    }

    // Clear the stored context
    sessionStorage.removeItem("billing_return_context");

    if (context.next === "questionnaire") {
      router.push(`/opportunities/start?id=${context.opportunityId}`);
    } else {
      router.push(`/discover?id=${context.opportunityId}`);
    }
  };

  const handleRetry = () => {
    if (context?.opportunityId) {
      router.push(`/opportunities/pricing?id=${context.opportunityId}`);
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <>
      <PageTitle title="Subscription Successful" />
      <Container maxW="container.md" py={20} mt={{ base: "80px", lg: "100px" }}>
        <Card.Root p={8}>
          <Card.Body>
            <VStack gap={6} textAlign="center">
              {isLoading || !isSubscriptionReady ? (
                <>
                  {/* Loading state */}
                  <Box
                    w={20}
                    h={20}
                    borderRadius="full"
                    bg="blue.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Loader
                      className="animate-spin"
                      size={40}
                      color="#3182CE"
                    />
                  </Box>

                  <VStack gap={2}>
                    <Heading size="xl">Processing Your Subscription</Heading>
                    <Text color="gray.600" fontSize="lg">
                      Please wait while we verify your payment...
                    </Text>
                  </VStack>

                  {checkAttempts >= maxAttempts && (
                    <Alert.Root status="warning" mt={4}>
                      <Alert.Indicator />
                      <Alert.Description>
                        Verification is taking longer than expected, but your
                        payment may have succeeded. Please try again later or
                        contact support.
                      </Alert.Description>
                    </Alert.Root>
                  )}
                </>
              ) : subscriptionStatus?.status === "active" ||
                subscriptionStatus?.status === "trialing" ? (
                <>
                  {/* Success state */}
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
                      Subscription Successful!
                    </Heading>
                    <Text color="gray.600" fontSize="lg">
                      Welcome aboard! Your subscription is now active.
                    </Text>
                  </VStack>

                  <VStack gap={3} w="100%" mt={4}>
                    <Text fontSize="sm" color="gray.600">
                      You now have access to all features of this opportunity
                    </Text>

                    <Button size="lg" w="100%" onClick={handleContinue}>
                      {context?.next === "questionnaire"
                        ? "Continue to Questionnaire"
                        : "Start Exploring"}
                    </Button>
                  </VStack>
                </>
              ) : (
                <>
                  {/* Error state */}
                  <Box
                    w={20}
                    h={20}
                    borderRadius="full"
                    bg="red.50"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <AlertCircle size={40} color="#E53E3E" />
                  </Box>

                  <VStack gap={2}>
                    <Heading size="xl" color="red.600">
                      Subscription Incomplete
                    </Heading>
                    <Text color="gray.600" fontSize="lg">
                      We were unable to verify your subscription status
                    </Text>
                  </VStack>

                  <Alert.Root status="error">
                    <Alert.Indicator />
                    <Alert.Title>Something Went Wrong</Alert.Title>
                    <Alert.Description>
                      Current status: {subscriptionStatus?.status || "Unknown"}
                      <br />
                      If you have completed payment, please contact support.
                    </Alert.Description>
                  </Alert.Root>

                  <HStack gap={3} w="100%" mt={4}>
                    <Button variant="ghost" flex={1} onClick={handleRetry}>
                      Retry
                    </Button>
                    <Button flex={1} onClick={() => router.push("/dashboard")}>
                      Return to Dashboard
                    </Button>
                  </HStack>
                </>
              )}

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
