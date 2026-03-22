"use client";

import React, { useMemo } from "react";
import {
  Box,
  Container,
  Text,
  VStack,
  HStack,
  Flex,
  Badge,
  SimpleGrid,
  Alert,
} from "@chakra-ui/react";
import NextLink from "next/link";
import { PageTitle } from "@/components/PageTitle";
import { PAGE_TITLES } from "@/utils/pageTitles";
import { useAuthStore } from "@/store/authStore";
import {
  useAccessibleOpportunities,
  categorizeOpportunities,
} from "@/services/shared";
import { useProductPricing } from "@/services/billing";
import { OpportunityCard } from "@/components/MyOpportunities";
import type {
  AccessInfo,
  Opportunity,
  AccessibleOpportunity,
} from "@/types/opportunities";
import Loader from "@/components/ui/Loader";
import { formatPrice } from "@/utils/formatPrice";
import { formatShortDate } from "@/utils/formatDate";
import { PROFILE_DARK_COLORS } from "@/theme/theme";
import { CONTACT_EMAIL } from "@/utils/constants";
import OpportunityCardSkeleton from "@/components/ui/OpportunityCardSkeleton";
import { Clock4, CreditCard, Calendar } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";

function computeAccessExpiryIso(access: AccessInfo): string | null {
  return (
    access.entitlement_expires_at ||
    access.active_override?.end ||
    access.subscription?.current_period_end ||
    null
  );
}

/**
 * Active subscription for this opportunity:
 */
function hasActiveSubscriptionAccess(access: AccessInfo | undefined): boolean {
  return !!access?.requires_subscription && !!access?.has_access;
}

function recurrenceLabel(
  interval: string | null | undefined,
  intervalCount: number | null | undefined
): string {
  if (!interval) return "—";
  const n = intervalCount ?? 1;
  if (interval === "year" && n === 1) return "Billed annually";
  if (interval === "month" && n === 1) return "Billed monthly";
  return `Every ${n} ${interval}${n > 1 ? "s" : ""}`;
}

export default function SubscriptionPage() {
  const { getUserType } = useAuthStore();
  const userTypeKey = getUserType();
  const userType = userTypeKey ?? "organisation";

  const {
    data: opportunities,
    isLoading: isLoadingOpportunities,
    error: opportunitiesError,
  } = useAccessibleOpportunities();

  // Find the opportunity with a subscription
  const pricingOpportunity = useMemo((): AccessibleOpportunity | null => {
    if (!opportunities?.length) return null;
    const sub = opportunities.find((o) => o.access?.requires_subscription);
    return sub ?? opportunities[0];
  }, [opportunities]);

  const pricingOppId = pricingOpportunity?.id ?? null;
  const pricingAccess = pricingOpportunity?.access;

  const { subscriptionStatusBadge, subscriptionActive } = useMemo(() => {
    if (!pricingAccess) {
      return {
        subscriptionActive: false,
        subscriptionStatusBadge: {
          label: "—",
          bg: "#F4F4F5",
          color: "#52525B",
        },
      };
    }
    if (!pricingAccess.requires_subscription) {
      return {
        subscriptionActive: false,
        subscriptionStatusBadge: {
          label: "No subscription required",
          bg: "#F4F4F5",
          color: "#52525B",
        },
      };
    }
    if (hasActiveSubscriptionAccess(pricingAccess)) {
      return {
        subscriptionActive: true,
        subscriptionStatusBadge: {
          label: "Active",
          bg: "#DCFCE7",
          color: "#116932",
        },
      };
    }
    return {
      subscriptionActive: false,
      subscriptionStatusBadge: {
        label: "Inactive",
        bg: "#FEE2E2",
        color: "#991B1B",
      },
    };
  }, [pricingAccess]);

  const heroExpiryIso = useMemo(() => {
    if (!pricingAccess) return null;
    return computeAccessExpiryIso(pricingAccess);
  }, [pricingAccess]);

  const billingCancelSection = useMemo(() => {
    const openSupportEmail = () => {
      window.location.href = `mailto:${CONTACT_EMAIL}`;
    };

    if (!pricingAccess) {
      return {
        title: "Billing & subscription",
        description: `Contact support at ${CONTACT_EMAIL} for billing questions.`,
        primaryButton: {
          label: "Contact support",
          onClick: openSupportEmail,
        },
      };
    }

    if (!pricingAccess.requires_subscription) {
      return {
        title: "Billing & subscription",
        description:
          "This plan does not use a paid subscription. For other questions, contact support.",
        primaryButton: {
          label: "Contact support",
          onClick: openSupportEmail,
        },
      };
    }

    if (!pricingAccess.has_access) {
      return {
        title: "Subscription",
        description:
          "Your organisation does not have access yet. Subscribe from pricing or contact support for help.",
        primaryButton: {
          label: "Contact support",
          onClick: openSupportEmail,
        },
      };
    }

    // Active access without a Stripe subscription no cancel UI
    // if (!pricingAccess.subscription) {
    //   return null;
    // }

    return {
      title: "Cancel subscription",
      description:
        "Cancel the subscription of the opportunity. When you cancel the subscription, you will be downgraded to the free plan and lose access to the features on your paid plan.",
      primaryButton: {
        label: "Cancel subscription",
        onClick: undefined,
      },
    };
  }, [pricingAccess]);

  const { data: productsPricing, isLoading: isLoadingPricing } =
    useProductPricing(pricingOppId, userTypeKey ?? null, {
      enabled: !!pricingOppId && userTypeKey === "organisation",
    });

  const pricingProduct = productsPricing?.products?.[0] ?? null;
  const primaryPrice =
    pricingProduct?.prices?.find((p) => p.interval === "year") ??
    pricingProduct?.prices?.[0] ??
    null;

  const categorized = useMemo(() => {
    if (!opportunities) return { enrolled: [] as Opportunity[], closed: [] };
    return categorizeOpportunities(opportunities);
  }, [opportunities]);

  const enrolled = categorized.enrolled;
  const totalListed = opportunities?.length ?? 0;

  const planName = pricingProduct?.name ?? "Subscription access";

  if (userTypeKey && userTypeKey !== "organisation") {
    return (
      <>
        <PageTitle title={PAGE_TITLES.SUBSCRIPTION} />
        <Container maxW="container.lg" py={10} px={{ base: 4, md: 8 }}>
          <Alert.Root status="info">
            <Alert.Indicator />
            <Alert.Title>Subscription</Alert.Title>
            <Alert.Description>
              Subscription management is available for organisation accounts.
            </Alert.Description>
          </Alert.Root>
        </Container>
      </>
    );
  }

  if (
    isLoadingOpportunities ||
    (userTypeKey === "organisation" && !!pricingOppId && isLoadingPricing)
  ) {
    return (
      <>
        <PageTitle title={PAGE_TITLES.SUBSCRIPTION} />
        <Container maxW="container.lg" py={10} px={{ base: 4, md: 8 }}>
          <VStack gap={6} align="stretch">
            <Loader type="component" size="xl" />
            <OpportunityCardSkeleton />
            <OpportunityCardSkeleton />
          </VStack>
        </Container>
      </>
    );
  }

  if (opportunitiesError) {
    return (
      <>
        <PageTitle title={PAGE_TITLES.SUBSCRIPTION} />
        <Container maxW="container.lg" py={10} px={{ base: 4, md: 8 }}>
          <Alert.Root status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to load opportunities</Alert.Title>
            <Alert.Description>
              Please try again later. If the problem persists, contact support.
            </Alert.Description>
          </Alert.Root>
        </Container>
      </>
    );
  }

  return (
    <>
      <PageTitle title={PAGE_TITLES.SUBSCRIPTION} />
      <VStack align="stretch" gap={10}>
        <Box
          borderRadius="xl"
          overflow="hidden"
          bg="#0F4F4D"
          color="white"
          p={{ base: 5, md: 6 }}
          backgroundImage={"url('/assets/subswaves.svg')"}
          backgroundSize="auto"
          backgroundRepeat="repeat"
          backgroundPosition="center"
        >
          <Flex
            justify="space-between"
            align="flex-start"
            gap={4}
            flexWrap="wrap"
          >
            <VStack
              align="flex-start"
              gap={2}
              w="full"
              borderBottom="1px solid #E4E4E7"
              pb={6}
            >
              <Badge
                bg={subscriptionStatusBadge.bg}
                color={subscriptionStatusBadge.color}
                px={2}
                py={0.5}
                borderRadius="md"
                fontWeight="semibold"
                textTransform="none"
              >
                {subscriptionStatusBadge.label}
              </Badge>
              <Text fontSize="xl" fontWeight="bold">
                {planName}
              </Text>
              {pricingAccess?.requires_subscription && !subscriptionActive && (
                <Text fontSize="sm" color="#D4D4D8" lineHeight="short">
                  Subscription is not active — subscribe to get access.
                </Text>
              )}
            </VStack>
          </Flex>

          <SimpleGrid
            columns={{ base: 2, sm: 2, lg: 3 }}
            gap={{ base: 4, md: 6 }}
            mt={6}
          >
            <HStack align="center" gap={3}>
              <Box
                bg="#548180"
                p={2}
                borderRadius="full"
                w={10}
                h={10}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <CreditCard size={20} color="white" />
              </Box>
              <Box>
                <Text fontSize="xs" color="#D4D4D8">
                  Price
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="semibold"
                  color="#FAFAFA"
                >
                  {primaryPrice
                    ? formatPrice(
                        primaryPrice.unit_amount,
                        primaryPrice.currency
                      )
                    : "—"}
                </Text>
              </Box>
            </HStack>
            <HStack align="center" gap={3}>
              <Box
                bg="#548180"
                p={2}
                borderRadius="full"
                w={10}
                h={10}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Clock4 size={20} color="white" />
              </Box>
              <Box>
                <Text fontSize="xs" color="#D4D4D8">
                  Recurrence
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="semibold"
                  color="#FAFAFA"
                >
                  {primaryPrice
                    ? recurrenceLabel(
                        primaryPrice.interval,
                        primaryPrice.interval_count
                      )
                    : "—"}
                </Text>
              </Box>
            </HStack>
            <HStack align="center" gap={3}>
              <Box
                bg="#548180"
                p={2}
                borderRadius="full"
                w={10}
                h={10}
                display="flex"
                alignItems="center"
                justifyContent="center"
              >
                <Calendar size={20} color="white" />
              </Box>
              <Box>
                <Text fontSize="xs" color="#D4D4D8">
                  Expiry date
                </Text>

                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="semibold"
                  color="#FAFAFA"
                >
                  {heroExpiryIso ? formatShortDate(heroExpiryIso) : "—"}
                </Text>
              </Box>
            </HStack>
          </SimpleGrid>
        </Box>

        {/* Enrolled opportunities */}
        <Box bg="white" p={6} borderRadius="xl" border="1px solid #E4E4E7">
          <Flex
            justify="space-between"
            align="center"
            gap={6}
            mb={4}
            flexWrap="wrap"
          >
            <Text fontSize="lg" fontWeight="semibold" color="#18181B">
              Enrolled Opportunities ({enrolled.length}/{totalListed || 0})
            </Text>
            <NextLink
              href="/profile"
              style={{
                fontSize: "14px",
                fontWeight: 500,
                color: PROFILE_DARK_COLORS.organisation,
              }}
            >
              Browse all
            </NextLink>
          </Flex>

          {enrolled.length === 0 ? (
            <Box
              p={8}
              borderRadius="12px"
              bg="#F8F9FA"
              border="1px solid #E2E8F0"
              textAlign="center"
            >
              <Text fontSize="md" color="#71717A">
                You&apos;re not enrolled in any opportunities yet.
              </Text>
            </Box>
          ) : (
            <VStack gap={4} align="stretch">
              {enrolled.map((opportunity: Opportunity) => (
                <OpportunityCard
                  key={opportunity.id}
                  opportunity={opportunity}
                  userType={userType}
                  type="enrolled"
                />
              ))}
            </VStack>
          )}
        </Box>

        {billingCancelSection && (
          <Box
            borderRadius="xl"
            border="1px solid"
            borderColor="#E4E4E7"
            bg="white"
            p={6}
          >
            <Text fontSize="md" fontWeight="semibold" color="#18181B" mb={2}>
              {billingCancelSection.title}
            </Text>
            <Flex
              justify="space-between"
              align="center"
              gap={4}
              flexWrap="wrap"
            >
              <Text
                fontSize="sm"
                color="#52525B"
                lineHeight="1.6"
                as="p"
                flex="1"
                minW="min(100%, 200px)"
              >
                {billingCancelSection.description}
              </Text>
              <ButtonV2
                variant="ghost"
                bg="#F4F4F5"
                border="1px solid #E4E4E7"
                borderRadius="xl"
                color="black"
                size="sm"
                fontWeight={500}
                flexShrink={0}
                onClick={billingCancelSection.primaryButton.onClick}
              >
                {billingCancelSection.primaryButton.label}
              </ButtonV2>
            </Flex>
          </Box>
        )}
      </VStack>
    </>
  );
}
