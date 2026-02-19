"use client";

import React from "react";
import { Box, VStack, Text, Button, Icon } from "@chakra-ui/react";
import { LockIcon } from "lucide-react";
import type { Opportunity } from "@/types/opportunities";
import type { AccessInfo } from "@/types/opportunities";

const DEFAULT_BENEFITS = [
  "Exclusive networking opportunities with partner organisations",
  "Personalized matching with organisations based on your profile",
  "Direct communication channels with organisation coordinators",
  "Priority consideration for special projects and initiatives",
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

  return (
    <VStack w="100%" h="100%" gap={10}>
      <VStack
        align="flex-start"
        gap={5}
        w="100%"
        bg="white"
        px={{ base: 4, md: 6 }}
        py={{ base: 4, md: 5 }}
        borderRadius="16px"
        border="1px solid"
        borderColor="#E4E4E7"
      >
        <VStack align="flex-start" gap={2} w="100%">
          <Text fontSize={{ base: "xl" }} fontWeight="semibold" color="#27272A">
            About the {opportunity.title} Program
          </Text>

          <Text fontSize="sm" color="#52525B" lineHeight="20px" maxW="594px">
            {opportunity.description || DEFAULT_DESCRIPTION}
          </Text>
        </VStack>

        <VStack align="flex-start" gap={2} w="100%">
          <Text fontSize="lg" fontWeight="semibold" color="#27272A">
            As an invited participant, you&apos;ll have access to:
          </Text>
          <Box as="ul" ml="10px" pl={5} m={0} listStyleType="disc">
            {DEFAULT_BENEFITS.map((benefit, i) => (
              <Text
                key={i}
                as="li"
                fontSize="md"
                color="#52525B"
                lineHeight="20px"
                mb={2}
              >
                {benefit}
              </Text>
            ))}
          </Box>
        </VStack>
      </VStack>
      <Button
        w="100%"
        bg="#36A2EB"
        color="white"
        _hover={{ bg: "#2B8AD4" }}
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
