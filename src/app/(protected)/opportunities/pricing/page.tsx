"use client";

import React, { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Box, Container, VStack, Alert, Text } from "@chakra-ui/react";
import { Loader } from "lucide-react";
import PricingSelector from "@/components/billing/PricingSelector";
import {
  useProductPricing,
  useCreateCheckoutSession,
} from "@/services/billing";
import { useAuthStore } from "@/store";
import {
  useOpportunityDetail,
  useOpportunityParticipant,
} from "@/services/shared";
import { toaster } from "@/components/ui/toaster";
import { PageTitle } from "@/components/PageTitle";
import { PricingTier } from "@/types/subscription";
import { FREE_TRIAL_DAYS } from "@/utils/constants";

export default function OpportunityPricingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const opportunityId = searchParams.get("id");
  const nextStep = searchParams.get("next");
  const { user } = useAuthStore();
  const userType = user?.user_types?.[0];

  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch opportunity details
  const {
    data: opportunity,
    isLoading: isLoadingOpportunity,
    error: opportunityError,
  } = useOpportunityDetail(opportunityId || "");

  // Fetch pricing
  const {
    data: productsData,
    isLoading: isLoadingPricing,
    error: pricingError,
  } = useProductPricing(opportunityId, userType || null);

  // Checkout mutation
  const checkoutMutation = useCreateCheckoutSession();

  // If no pricing available, redirect to questionnaire or direct enrollment
  useEffect(() => {
    if (
      !isLoadingPricing &&
      productsData &&
      (!productsData.products || productsData.products.length === 0)
    ) {
      toaster.create({
        title: "This opportunity does not require a paid subscription",
        type: "info",
      });

      if (nextStep === "questionnaire") {
        router.push(`/opportunities/start?id=${opportunityId}`);
      } else {
        router.push(`/discover?id=${opportunityId}`);
      }
    }
  }, [isLoadingPricing, productsData, nextStep, opportunityId, router]);

  const handleSelectPlan = async (selectedTier: PricingTier) => {
    if (!userType) {
      toaster.create({
        title: "Missing required information",
        description: "Unable to create subscription session",
        type: "error",
      });
      return;
    }
    setIsProcessing(true);
    try {
      // Create checkout data with new API format
      const checkoutData: any = {
        price_id: selectedTier.price_id,
        user_type: userType,
        opportunity_id: Number(opportunityId),
        trial_days: FREE_TRIAL_DAYS,
      };
      // Add trial_days if available
      if (selectedTier?.trial_days && selectedTier.trial_days > 0) {
        checkoutData.trial_days = selectedTier.trial_days;
      }
      const response = await checkoutMutation.mutateAsync(checkoutData);
      if (response.url) {
        // Store the return context
        if (nextStep === "questionnaire") {
          sessionStorage.setItem(
            "billing_return_context",
            JSON.stringify({
              opportunityId,
              next: "questionnaire",
            })
          );
        } else {
          sessionStorage.setItem(
            "billing_return_context",
            JSON.stringify({
              opportunityId,
              next: "discover",
            })
          );
        }
        // Redirect to Stripe Checkout
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: any) {
      console.error("❌ [Pricing] Failed to create checkout session:", error);
      toaster.create({
        title: "Failed to create subscription",
        description: error?.message || "Please try again later",
        type: "error",
      });
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoadingOpportunity || isLoadingPricing) {
    return (
      <>
        <PageTitle title="Choose Subscription Plan" />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minH="60vh"
          mt={{ base: "80px", lg: "100px" }}
        >
          <VStack gap={4}>
            <Loader className="animate-spin" size={40} />
            <Text color="gray.500">Loading pricing information...</Text>
          </VStack>
        </Box>
      </>
    );
  }

  if (opportunityError || pricingError) {
    return (
      <>
        <PageTitle title="Error" />
        <Container
          maxW="container.lg"
          py={10}
          mt={{ base: "80px", lg: "100px" }}
        >
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to Load</Alert.Title>
            <Alert.Description>
              {(opportunityError as any)?.message ||
                (pricingError as any)?.message ||
                "Unable to load pricing information. Please try again later."}
            </Alert.Description>
          </Alert.Root>
        </Container>
      </>
    );
  }

  if (
    !productsData ||
    !productsData.products ||
    productsData.products.length === 0
  ) {
    // This will be handled by useEffect redirect
    return (
      <>
        <PageTitle title="Loading" />
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minH="60vh"
          mt={{ base: "80px", lg: "100px" }}
        >
          <Loader className="animate-spin" size={40} />
        </Box>
      </>
    );
  }

  return (
    <>
      <PageTitle title={`Subscribe - ${opportunity?.title || "Opportunity"}`} />
      <Container maxW="container.xl" py={10} mt={{ base: "80px", lg: "100px" }}>
        <PricingSelector
          opportunityTitle={opportunity?.title}
          products={productsData.products}
          onSubscribeClick={handleSelectPlan}
          onCancel={handleCancel}
          isLoading={isProcessing}
        />
      </Container>
    </>
  );
}
