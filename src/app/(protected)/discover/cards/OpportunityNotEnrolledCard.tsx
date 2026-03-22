"use client";

import React from "react";
import { Box, VStack, Text, Button, Icon } from "@chakra-ui/react";
import { LockIcon } from "lucide-react";
import type { Opportunity } from "@/types/opportunities";
import type { AccessInfo } from "@/types/opportunities";
import { useAuthStore } from "@/store/authStore";
import {
  PROFILE_COLORS,
  PROFILE_SECONDARY_COLORS,
  PROFILE_TINT_COLORS,
} from "@/theme/theme";

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

const DEFAULT_DESCRIPTION =
  "Ready to connect with industry partners seeking university talent? Join the Opportunity to access part-time, casual, and graduate roles within your university community.";

interface OpportunityNotEnrolledCardProps {
  opportunity: Opportunity;
  accessInfo: AccessInfo | null;
  onEnroll: () => void;
  isSubmitting: boolean;
}

export function OpportunityNotEnrolledCard({
  opportunity,
  accessInfo,
  onEnroll,
  isSubmitting,
}: OpportunityNotEnrolledCardProps) {
  const isSubscribe = accessInfo?.next_action === "subscribe";
  const { getUserType } = useAuthStore();
  const isOrganisation = getUserType() === "organisation";

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
        {isSubscribe && <Icon as={LockIcon} mr={2} />}
        {isSubscribe ? "Subscribe" : "Enroll"}
      </Button>
    </VStack>
  );
}
