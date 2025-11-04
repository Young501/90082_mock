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
import { PageTitle } from "@/components/PageTitle";

export default function BillingSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [context, setContext] = useState<{
    opportunityId: string;
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
