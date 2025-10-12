"use client";

import React, { useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Card,
  SimpleGrid,
  Badge,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { PricingTier } from "@/types/subscription";
import { CheckCircle, Loader } from "lucide-react";

interface PricingSelectorProps {
  opportunityTitle?: string;
  pricingTiers: PricingTier[];
  onSelectPlan: (interval: "month" | "year") => void;
  onCancel?: () => void;
  isLoading?: boolean;
}

export const PricingSelector: React.FC<PricingSelectorProps> = ({
  opportunityTitle,
  pricingTiers,
  onSelectPlan,
  onCancel,
  isLoading = false,
}) => {
  const [selectedInterval, setSelectedInterval] = useState<
    "month" | "year" | null
  >(null);

  const formatPrice = (price: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price / 100); // Assuming price is in cents
  };

  const getIntervalLabel = (interval: "month" | "year") => {
    return interval === "month" ? "Monthly" : "Yearly";
  };

  const handleContinue = (interval: "month" | "year") => {
    setSelectedInterval(interval);
    onSelectPlan(interval);
  };

  if (pricingTiers.length === 0) {
    return (
      <Box p={6} textAlign="center">
        <Text color="gray.500">No pricing plans available</Text>
        {onCancel && (
          <Button mt={4} onClick={onCancel}>
            Go Back
          </Button>
        )}
      </Box>
    );
  }

  return (
    <VStack gap={6} w="100%" maxW="900px" mx="auto" p={6}>
      <VStack gap={2} textAlign="center">
        <Heading size="xl">Choose Your Plan</Heading>
        {opportunityTitle && (
          <Text fontSize="lg" color="gray.600">
            {opportunityTitle}
          </Text>
        )}
        <Text color="gray.500">
          Select the plan that best fits your needs to access this opportunity
        </Text>
      </VStack>

      <SimpleGrid
        columns={{ base: 1, md: pricingTiers.length === 1 ? 1 : 2 }}
        gap={6}
        w="100%"
      >
        {pricingTiers.map((tier) => {
          const isYearly = tier.interval === "year";
          const savingsPercentage = isYearly ? 17 : 0; // Example: yearly saves 17%

          return (
            <Card.Root
              key={tier.id}
              p={6}
              borderWidth={2}
              borderColor={isYearly ? "green.500" : "gray.200"}
              position="relative"
              overflow="visible"
              _hover={{
                borderColor: isYearly ? "green.600" : "gray.300",
                transform: "translateY(-4px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
            >
              {isYearly && (
                <Badge
                  colorScheme="green"
                  position="absolute"
                  top="-12px"
                  right="20px"
                  px={3}
                  py={1}
                  fontSize="sm"
                  borderRadius="full"
                >
                  Recommended
                </Badge>
              )}

              <Card.Body>
                <VStack gap={4} align="stretch">
                  {/* Plan header */}
                  <VStack gap={1} align="flex-start">
                    <Text
                      fontSize="lg"
                      fontWeight="bold"
                      textTransform="uppercase"
                      color="gray.600"
                    >
                      {getIntervalLabel(tier.interval)}
                    </Text>
                    <HStack align="baseline" gap={2}>
                      <Text fontSize="4xl" fontWeight="bold">
                        {formatPrice(tier.price, tier.currency)}
                      </Text>
                      <Text color="gray.500">
                        / {tier.interval === "month" ? "month" : "year"}
                      </Text>
                    </HStack>
                    {isYearly && savingsPercentage > 0 && (
                      <Badge colorScheme="green" variant="subtle">
                        Save {savingsPercentage}%
                      </Badge>
                    )}
                  </VStack>

                  {/* Description */}
                  {tier.description && (
                    <Text color="gray.600">{tier.description}</Text>
                  )}

                  {/* Trial info */}
                  {tier.trial_days && tier.trial_days > 0 && (
                    <HStack
                      p={3}
                      bg="blue.50"
                      borderRadius="md"
                      borderWidth={1}
                      borderColor="blue.200"
                    >
                      <CheckCircle size={20} color="#3182CE" />
                      <Text fontSize="sm" color="blue.700" fontWeight="medium">
                        Includes {tier.trial_days} day free trial
                      </Text>
                    </HStack>
                  )}

                  {/* Features list */}
                  <VStack gap={2} align="stretch" pt={2}>
                    <HStack>
                      <CheckCircle size={18} color="#48BB78" />
                      <Text fontSize="sm">Full access to all features</Text>
                    </HStack>
                    <HStack>
                      <CheckCircle size={18} color="#48BB78" />
                      <Text fontSize="sm">View complete user profiles</Text>
                    </HStack>
                    <HStack>
                      <CheckCircle size={18} color="#48BB78" />
                      <Text fontSize="sm">Unlimited opportunity browsing</Text>
                    </HStack>
                    <HStack>
                      <CheckCircle size={18} color="#48BB78" />
                      <Text fontSize="sm">Cancel anytime</Text>
                    </HStack>
                  </VStack>

                  {/* CTA Button */}
                  <Button
                    size="lg"
                    colorScheme={isYearly ? "green" : "blue"}
                    w="100%"
                    mt={4}
                    onClick={() => handleContinue(tier.interval)}
                    loading={isLoading && selectedInterval === tier.interval}
                    disabled={isLoading}
                  >
                    {isLoading && selectedInterval === tier.interval ? (
                      <>
                        <Loader className="animate-spin mr-2" size={18} />
                        Processing...
                      </>
                    ) : tier.trial_days && tier.trial_days > 0 ? (
                      "Start Free Trial"
                    ) : (
                      "Subscribe Now"
                    )}
                  </Button>
                </VStack>
              </Card.Body>
            </Card.Root>
          );
        })}
      </SimpleGrid>

      {/* Cancel button */}
      {onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          disabled={isLoading}
          size="md"
        >
          Cancel
        </Button>
      )}

      {/* Terms */}
      <Text fontSize="xs" color="gray.500" textAlign="center" maxW="600px">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time in account settings.
      </Text>
    </VStack>
  );
};

export default PricingSelector;
