"use client";

import React from "react";
import { Box, VStack, Text, Button, Icon, Spinner } from "@chakra-ui/react";
import { LockIcon } from "lucide-react";
import type { Opportunity } from "@/types/opportunities";
import type { AccessInfo } from "@/types/opportunities";
import type { Product } from "@/types/subscription";
import { useAuthStore } from "@/store/authStore";
import {
  PROFILE_COLORS,
  PROFILE_HOVER_COLORS,
  PROFILE_SECONDARY_COLORS,
  PROFILE_TINT_COLORS,
} from "@/theme/theme";
import { FeatureList } from "@/components/billing/PricingSelector";
import { formatPrice } from "@/utils/formatPrice";

const DEFAULT_BENEFITS = [
  "Exclusive networking opportunities with partner organisations",
  "Personalized matching with organisations based on your profile",
  "Direct communication channels with organisation coordinators",
  "Priority consideration for special projects and initiatives",
];

const ORGANISATION_BENEFITS = [
  "Incredible talent from the University",
  "The ability to filter candidates to meet your workforce needs",
  "Direct messaging with candidates",
  "Priority invitations to other University opportunities",
];

interface OpportunityNotEnrolledCardProps {
  opportunity: Opportunity;
  accessInfo: AccessInfo | null;
  onEnroll: () => void;
  isSubmitting: boolean;
  pricingProduct?: Product | null;
  isPricingLoading?: boolean;
}

export function OpportunityNotEnrolledCard({
  opportunity,
  accessInfo,
  onEnroll,
  isSubmitting,
  pricingProduct,
  isPricingLoading,
}: OpportunityNotEnrolledCardProps) {
  const isSubscribe = accessInfo?.next_action === "subscribe";
  const requiresSubscription = accessInfo?.requires_subscription === true;
  const { getUserType } = useAuthStore();
  const isOrganisation = getUserType() === "organisation";

  const showSubscriptionPricing =
    requiresSubscription && isSubscribe && (isPricingLoading || pricingProduct);

  const primaryPrice =
    pricingProduct?.prices?.find((p) => p.interval === "year") ??
    pricingProduct?.prices?.[0];

  if (requiresSubscription && isSubscribe && isPricingLoading) {
    return (
      <VStack w="100%" py={10} gap={4}>
        <Spinner size="lg" color="teal.500" />
        <Text color="gray.600" fontSize="sm">
          Loading subscription options…
        </Text>
      </VStack>
    );
  }

  if (showSubscriptionPricing && pricingProduct && primaryPrice) {
    return (
      <VStack w="100%" h="100%" gap={10}>
        <VStack
          align="flex-start"
          gap={5}
          w="100%"
          bg="white"
          py={{ base: 4, md: 6 }}
          px={{ base: 4, md: 5 }}
          borderRadius="12px"
          border="1px solid"
          borderColor="#E4E4E7"
        >
          <Text fontSize="sm" fontWeight="medium" color="#71717A">
            {opportunity.title}
          </Text>
          <Text fontSize="lg" fontWeight="semibold" color="#27272A">
            {pricingProduct.name}
          </Text>
          {pricingProduct.description ? (
            <Text fontSize="sm" color="#52525B" lineHeight="1.6">
              {pricingProduct.description}
            </Text>
          ) : null}
          <Box
            w="100%"
            p={4}
            bg={
              isOrganisation
                ? PROFILE_SECONDARY_COLORS.organisation
                : "gray.50"
            }
            border="1px solid"
            borderColor={
              isOrganisation
                ? PROFILE_BORDER_COLORS.organisation
                : "gray.200"
            }
            borderRadius="12px"
          >
            <Text fontSize="sm" color="#52525B" mb={1}>
              {primaryPrice.nickname || "Yearly billing"}
            </Text>
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={isOrganisation ? PROFILE_COLORS.organisation : "#27272A"}
            >
              {formatPrice(primaryPrice.unit_amount, primaryPrice.currency)}
              <Text as="span" fontSize="md" fontWeight="normal" color="#71717A" ml={1}>
                /{" "}
                {primaryPrice.interval_count === 1
                  ? primaryPrice.interval === "year"
                    ? "year"
                    : primaryPrice.interval
                  : `${primaryPrice.interval_count} ${primaryPrice.interval}`}
              </Text>
            </Text>
          </Box>
          {pricingProduct.marketing_features &&
            pricingProduct.marketing_features.length > 0 && (
              <FeatureList features={pricingProduct.marketing_features} />
            )}
        </VStack>
        <Button
          w="100%"
          bg={isOrganisation ? PROFILE_COLORS.organisation : "#36A2EB"}
          color="white"
          _hover={{ bg: isOrganisation ? "#2E9994" : "#2B8AD4" }}
          size="lg"
          h="44px"
          borderRadius="xl"
          py={6}
          onClick={onEnroll}
          loading={isSubmitting}
          disabled={isSubmitting}
          fontWeight="semibold"
        >
          <Icon as={LockIcon} mr={2} />
          Subscribe
        </Button>
      </VStack>
    );
  }

  return (
    <VStack w="100%" h="100%" gap={10}>
      <VStack
        align="flex-start"
        gap={5}
        w="100%"
        bg="white"
        py={{ base: 4, md: 6 }}
        px={{ base: 4, md: 5 }}
        borderRadius="12px"
        border="1px solid"
        borderColor="#E4E4E7"
      >
        <VStack align="flex-start" gap={2} w="100%">
          <Text fontSize="sm" fontWeight="medium" color="#71717A">
            {opportunity.title}
          </Text>
          <Text fontSize="md" fontWeight="semibold" color="#27272A">
            {isOrganisation
              ? "As an organisation in the employment opportunity, you\u2019ll have access to:"
              : "As an invited participant, you\u2019ll have access to:"}
          </Text>
          <Box as="ul" ml="10px" pl={5} m={0} listStyleType="disc">
            {(isOrganisation ? ORGANISATION_BENEFITS : DEFAULT_BENEFITS).map(
              (benefit, i) => (
                <Text
                  key={i}
                  as="li"
                  fontSize="sm"
                  color="#52525B"
                  lineHeight="20px"
                  mb={2}
                >
                  {benefit}
                </Text>
              )
            )}
          </Box>
          {isOrganisation && (
            <Box
              w="100%"
              mt={2}
              p={4}
              bg={PROFILE_SECONDARY_COLORS.organisation}
              border="1px solid"
              borderColor={PROFILE_TINT_COLORS.organisation}
              borderRadius="12px"
            >
              <Text fontSize="sm" color="#52525B" mb={1}>
                Accessing the incredible talent in the Employment Pool is via an
                annual subscription
              </Text>
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={PROFILE_COLORS.organisation}
              >
                $2,500 / year
              </Text>
            </Box>
          )}
        </VStack>
      </VStack>
      <Button
        w="100%"
        bg={isOrganisation ? PROFILE_COLORS.organisation : "#36A2EB"}
        color="white"
        _hover={{ bg: isOrganisation ? PROFILE_HOVER_COLORS.organisation : PROFILE_HOVER_COLORS.student }}
        size="lg"
        h="44px"
        borderRadius="xl"
        py={6}
        onClick={onEnroll}
        loading={isSubmitting}
        disabled={isSubmitting}
        fontWeight="semibold"
      >
        {isSubscribe && <Icon as={LockIcon} mr={2} />}
        {isSubscribe ? "Subscribe" : "Enroll"}
      </Button>
    </VStack>
  );
}
