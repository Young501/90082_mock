"use client";

import React, { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Box, Container, VStack, Alert, Text } from "@chakra-ui/react";
import Loader from "@/components/ui/Loader";
import { useCreateCheckoutSession } from "@/services/billing";
import { useAuthStore } from "@/store";
import { useAccessibleOpportunities } from "@/services/shared";
import { useProductPricing } from "@/services/billing";
import { toaster } from "@/components/ui/toaster";
import { PageTitle } from "@/components/PageTitle";
import { CheckoutSessionRequest, PricingTier } from "@/types/subscription";
import {
  findOpportunityByIdOrSlug,
  toBaseOpportunity,
} from "@/utils/findOpportunity";
import { OpportunityNotEnrolledCard } from "@/app/(protected)/discover/cards/OpportunityNotEnrolledCard";
import type { Opportunity } from "@/types/opportunities";
import { STRIPE_PRICING_ENABLED } from "@/hooks/useHandleEnroll";

const UNIMELB_SUBSCRIPTION_URL =
  "https://ecommerce.unimelb.edu.au/uniconnected-subscription";

export default function OpportunityPricingPage() {
  const searchParams = useSearchParams();
  const opportunitySlug = searchParams.get("opp");
  const nextStep = searchParams.get("next");
  const { user, getUserType, accessibleOpportunities: storedAccessibleOpps } =
    useAuthStore();
  const userType = user?.user_types?.[0];
  const userTypeKey = getUserType();

  const [isProcessing, setIsProcessing] = useState(false);

  const { data: queryAccessibleOpps, isLoading: isOpportunitiesLoading } =
    useAccessibleOpportunities();

  const accessibleOpportunities =
    storedAccessibleOpps ?? queryAccessibleOpps ?? null;

  const currentOpportunity = findOpportunityByIdOrSlug(
    accessibleOpportunities,
    opportunitySlug
  );
  const opportunityId = currentOpportunity?.id;
  const accessInfo = currentOpportunity?.access ?? null;
  const trialEligibility = currentOpportunity?.access.trial_eligibility;
  const trialDays = trialEligibility?.eligible
    ? trialEligibility?.days_total
    : 0;

  const opportunity: Opportunity | null = useMemo(
    () => toBaseOpportunity(currentOpportunity),
    [currentOpportunity]
  );

  const {
    data: productsData,
    isLoading: isLoadingPricing,
    error: pricingError,
  } = useProductPricing(opportunityId || null, userTypeKey || null, {
    enabled: !!opportunityId && !!userTypeKey,
  });

  const checkoutMutation = useCreateCheckoutSession();

  const pricingProduct = productsData?.products?.[0] ?? null;
  const primaryPrice: PricingTier | undefined =
    pricingProduct?.prices?.find((p) => p.interval === "year") ??
    pricingProduct?.prices?.[0];

  const handleSubscribe = async () => {
    if (!opportunityId || !userTypeKey || !pricingProduct || !primaryPrice) {
      toaster.create({
        title: "Missing required information",
        description: "Unable to start subscription",
        type: "error",
      });
      return;
    }

    if (!STRIPE_PRICING_ENABLED) {
      window.location.href =
        pricingProduct.subscribe_link || UNIMELB_SUBSCRIPTION_URL;
      return;
    }

    setIsProcessing(true);
    try {
      const checkoutData: CheckoutSessionRequest = {
        price_id: primaryPrice.price_id,
        user_type: userTypeKey,
        opportunity_id: Number(opportunityId),
        ...(trialDays > 0 ? { trial_days: trialDays } : {}),
      };
      const response = await checkoutMutation.mutateAsync(checkoutData);
      if (response.url) {
        const contextData: Record<string, string> = {
          next: nextStep === "questionnaire" ? "questionnaire" : "discover",
        };
        if (opportunitySlug) {
          contextData.opportunitySlug = opportunitySlug;
        }
        sessionStorage.setItem(
          "billing_return_context",
          JSON.stringify(contextData)
        );
        window.location.href = response.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error: unknown) {
      console.error("❌ [Pricing] Failed to create checkout session:", error);
      toaster.create({
        title: "Failed to create subscription",
        description:
          error instanceof Error ? error.message : "Please try again later",
        type: "error",
      });
      setIsProcessing(false);
    }
  };

  if (isOpportunitiesLoading || isLoadingPricing) {
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
            <Loader type="component" size="xl" />
            <Text color="gray.500">Loading pricing information...</Text>
          </VStack>
        </Box>
      </>
    );
  }

  if (pricingError || !opportunity || !currentOpportunity || !accessInfo) {
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
              {(pricingError as Error)?.message ||
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
    return (
      <>
        <PageTitle title="Subscription" />
        <Container
          maxW="container.lg"
          py={10}
          mt={{ base: "80px", lg: "100px" }}
        >
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>No subscription required</Alert.Title>
            <Alert.Description>
              This opportunity does not have a paid plan configured. You can go
              back to Discover.
            </Alert.Description>
          </Alert.Root>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageTitle title={`Subscribe - ${opportunity.title}`} />
      <Container maxW="container.md" py={10} mt={{ base: "80px", lg: "100px" }}>
        <OpportunityNotEnrolledCard
          opportunity={opportunity}
          accessInfo={accessInfo}
          onEnroll={handleSubscribe}
          isSubmitting={isProcessing}
          pricingProduct={pricingProduct}
          isPricingLoading={false}
        />
      </Container>
    </>
  );
}
