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
import { useAccessibleOpportunities } from "@/services/shared";
import { useProductPricing } from "@/services/billing";
import { OpportunityCard } from "@/components/MyOpportunities";
import type { AccessInfo, AccessibleOpportunity } from "@/types/opportunities";
import Loader from "@/components/ui/Loader";
import { formatPrice } from "@/utils/formatPrice";
import { formatShortDate } from "@/utils/formatDate";
import OpportunityCardSkeleton from "@/components/ui/OpportunityCardSkeleton";
import { Clock4, CreditCard, Calendar } from "lucide-react";
import { ButtonV2 } from "@/components/ui/ButtonV2";

const COLORS = {
  border: "#E4E4E7",
  textPrimary: "#18181B",
  textSecondary: "#52525B",
  textMutedOnDark: "#D4D4D8",
  textOnDark: "#FAFAFA",
  expiringRed: "#FCA5A5",
} as const;

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
          color: COLORS.textSecondary,
        },
      };
    }
    if (!pricingAccess.requires_subscription) {
      return {
        subscriptionActive: false,
        subscriptionStatusBadge: {
          label: "No subscription required",
          bg: "#F4F4F5",
          color: COLORS.textSecondary,
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

  const isExpiringSoon = useMemo(() => {
    if (!heroExpiryIso) return false;
    const diff = new Date(heroExpiryIso).getTime() - Date.now();
    return diff > 0 && diff <= 7 * 24 * 60 * 60 * 1000;
  }, [heroExpiryIso]);

  const billingCancelSection = useMemo(() => {
    if (!pricingAccess) {
      return {
        title: "Subscription support",
        description:
          "If you need any support with your subscription, including cancellation or other technical support, please reach out to us.",
        primaryButton: { label: "Contact us", href: "/support/" },
      };
    }

    if (!pricingAccess.requires_subscription) {
      return {
        title: "Subscription support",
        description:
          "If you need any support with your subscription, including cancellation or other technical support, please reach out to us.",
        primaryButton: { label: "Contact us", href: "/support/" },
      };
    }

    if (!pricingAccess.has_access) {
      return {
        title: "Subscription support",
        description:
          "If you need any support with your subscription, including cancellation or other technical support, please reach out to us.",
        primaryButton: { label: "Contact us", href: "/support/" },
      };
    }

    return {
      title: "Subscription support",
      description:
        "If you need any support with your subscription, including cancellation or other technical support, please reach out to us.",
      primaryButton: { label: "Contact us", href: "/support/" },
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

  const pricingOpportunitySlug =
    pricingProduct?.metadata?.opportunity_slug ?? null;
  const pricingOpportunityPublicId =
    pricingProduct?.metadata?.opportunity_public_id ?? null;

  const linkedOpportunity = useMemo(() => {
    if (!opportunities) return null;
    if (pricingOpportunitySlug) {
      return opportunities.find((o) => o.slug === pricingOpportunitySlug) ?? null;
    }
    if (pricingOpportunityPublicId) {
      return opportunities.find((o) => o.public_id === pricingOpportunityPublicId) ?? null;
    }
    return null;
  }, [opportunities, pricingOpportunitySlug, pricingOpportunityPublicId]);

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
              borderBottom={`1px solid ${COLORS.border}`}
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
                <Text fontSize="sm" color={COLORS.textMutedOnDark} lineHeight="short">
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
                <Text fontSize="xs" color={COLORS.textMutedOnDark}>
                  Price
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="semibold"
                  color={COLORS.textOnDark}
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
                <Text fontSize="xs" color={COLORS.textMutedOnDark}>
                  Recurrence
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="semibold"
                  color={COLORS.textOnDark}
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
                <Text fontSize="xs" color={COLORS.textMutedOnDark}>
                  Expiry date
                </Text>
                <Text
                  fontSize={{ base: "sm", md: "lg" }}
                  fontWeight="semibold"
                  color={isExpiringSoon ? COLORS.expiringRed : COLORS.textOnDark}
                >
                  {heroExpiryIso ? formatShortDate(heroExpiryIso) : "—"}
                </Text>
                {isExpiringSoon && (
                  <Text fontSize="xs" color={COLORS.expiringRed} fontWeight="medium">
                    Expiring soon —{" "}
                    <NextLink
                      href="/support/"
                      style={{ color: COLORS.expiringRed, textDecoration: "underline" }}
                    >
                      contact us
                    </NextLink>{" "}
                    to keep your subscription active
                  </Text>
                )}
              </Box>
            </HStack>
          </SimpleGrid>
        </Box>

        {/* Enrolled opportunities */}
        <Box bg="white" p={6} borderRadius="xl" border={`1px solid ${COLORS.border}`}>
          <Flex
            justify="space-between"
            align="center"
            gap={6}
            mb={4}
            flexWrap="wrap"
          >
            <Text fontSize="lg" fontWeight="semibold" color={COLORS.textPrimary}>
              Linked Opportunity
            </Text>
          </Flex>

          {!linkedOpportunity ? (
            <Box
              p={8}
              borderRadius="12px"
              bg="#F8F9FA"
              border="1px solid #E2E8F0"
              textAlign="center"
            >
              <Text fontSize="md" color={COLORS.textSecondary}>
                No opportunity linked to your subscription.
              </Text>
            </Box>
          ) : (
            <OpportunityCard
              opportunity={linkedOpportunity}
              userType={userType}
              type={linkedOpportunity.enrollment_status === "enrolled" ? "enrolled" : "closed"}
            />
          )}
        </Box>

        {billingCancelSection && (
          <Box
            borderRadius="xl"
            border="1px solid"
            borderColor={COLORS.border}
            bg="white"
            p={6}
          >
            <Text fontSize="md" fontWeight="semibold" color={COLORS.textPrimary} mb={2}>
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
                color={COLORS.textSecondary}
                lineHeight="1.6"
                as="p"
                flex="1"
                minW="min(100%, 200px)"
              >
                {billingCancelSection.description}
              </Text>
              <NextLink href={billingCancelSection.primaryButton.href}>
                <ButtonV2
                  variant="ghost"
                  bg="#F4F4F5"
                  border={`1px solid ${COLORS.border}`}
                  borderRadius="xl"
                  color="black"
                  size="sm"
                  fontWeight={500}
                  flexShrink={0}
                >
                  {billingCancelSection.primaryButton.label}
                </ButtonV2>
              </NextLink>
            </Flex>
          </Box>
        )}
      </VStack>
    </>
  );
}
