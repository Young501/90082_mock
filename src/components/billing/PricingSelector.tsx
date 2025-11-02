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
import { PricingTier, Product } from "@/types/subscription";
import { CheckCircle, Loader, XCircle } from "lucide-react";

interface PricingSelectorProps {
  opportunityTitle?: string;
  products: Product[];
  onSubscribeClick: (selectedTier: PricingTier) => void;
  onCancel?: () => void;
  trialDays?: number;
  isLoading?: boolean;
}

interface FeatureItem {
  label: string;
  supported: boolean;
}

interface FeatureListProps {
  features: string[];
}

export function FeatureList({ features }: FeatureListProps) {
  // parse the strings into FeatureItem
  const parsedFeatures = features.map((featStr, i) => {
    try {
      // Replace single quotes with double quotes to make it JSON‐parsable
      const jsonString = featStr
        .replace(/'/g, '"')
        .replace(/True/g, "true")
        .replace(/False/g, "false");
      const obj = JSON.parse(jsonString);
      return {
        label: obj.label,
        supported: Boolean(obj.supported),
      } as FeatureItem;
    } catch {
      // fallback if parsing fails
      return { label: featStr, supported: true };
    }
  });

  return (
    <VStack gap={4} align="stretch" pt={2}>
      {parsedFeatures.map((feat, i) => (
        <HStack key={i}>
          {feat.supported ? (
            <CheckCircle size={18} color="#48BB78" />
          ) : (
            <XCircle size={18} color="#E53E3E" />
          )}
          <Text fontSize="sm" color={feat.supported ? "inherit" : "gray.500"}>
            {feat.label}
          </Text>
        </HStack>
      ))}
    </VStack>
  );
}

export const PricingSelector: React.FC<PricingSelectorProps> = ({
  opportunityTitle,
  products,
  onSubscribeClick,
  onCancel,
  trialDays = 0,
  isLoading = false,
}) => {
  const [loadingPriceId, setLoadingPriceId] = useState<string | null>(null);
  const formatPrice = (price: number, currency: string = "USD") => {
    const normalizedCurrency = currency.toUpperCase();
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: normalizedCurrency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price / 100);
  };

  if (!products || products.length === 0) {
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

  const sortedProducts = products.slice().sort((a, b) => {
    const ao = a.metadata?.display_order
      ? Number(a.metadata.display_order)
      : Infinity;
    const bo = b.metadata?.display_order
      ? Number(b.metadata.display_order)
      : Infinity;
    return ao - bo;
  });

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
        columns={{ base: 1, md: sortedProducts.length === 1 ? 1 : 2 }}
        gap={6}
        w="100%"
      >
        {sortedProducts.map((product) => {
          const isRecommended = product.metadata?.recommended === "true";

          const defaultPrice = product.prices.find(
            (p) => p.price_id === product.default_price_id
          );
          const displayPrice = defaultPrice ?? product.prices[0];

          return (
            <Card.Root
              key={product.id}
              p={6}
              borderWidth={2}
              borderColor={isRecommended ? "green.500" : "gray.200"}
              position="relative"
              _hover={{
                borderColor: isRecommended ? "green.600" : "gray.300",
                transform: "translateY(-4px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
              // ensure card is flex container & full height
              display="flex"
              flexDirection="column"
            >
              {isRecommended && (
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

              <VStack align="stretch" gap={8} flexGrow={1}>
                {/* Header */}
                <VStack align="flex-start" gap={1}>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="gray.600"
                  >
                    {product.name}
                  </Text>
                  <HStack align="baseline" gap={2}>
                    <Text fontSize="4xl" fontWeight="bold">
                      {formatPrice(
                        displayPrice.unit_amount,
                        displayPrice.currency
                      )}
                    </Text>
                    <Text color="gray.500">/ {displayPrice.interval}</Text>
                  </HStack>
                  {trialDays > 0 && (
                    <Badge colorScheme="blue" variant="subtle">
                      Includes {trialDays}-day free trial
                    </Badge>
                  )}
                </VStack>

                {/* Description */}
                <Box minH="100px">
                  {" "}
                  {/* adjust height to approximate 3-4 lines at your font size */}
                  {product.description && (
                    <Text color="gray.600">{product.description}</Text>
                  )}
                </Box>

                {/* Features list */}
                {product.marketing_features &&
                  product.marketing_features.length > 0 && (
                    <FeatureList features={product.marketing_features} />
                  )}
              </VStack>

              {/* Call to action */}
              <Box mt={20}>
                <Button
                  size="lg"
                  colorScheme={isRecommended ? "green" : "blue"}
                  w="100%"
                  onClick={() => {
                    setLoadingPriceId(displayPrice.price_id);
                    onSubscribeClick(displayPrice);
                  }}
                  isLoading={
                    isLoading && loadingPriceId === displayPrice.price_id
                  }
                  disabled={isLoading}
                >
                  {isLoading && loadingPriceId === displayPrice.price_id ? (
                    <Loader className="animate-spin mr-2" size={18} />
                  ) : (
                    "Subscribe Now"
                  )}
                </Button>
              </Box>
            </Card.Root>
          );
        })}
      </SimpleGrid>

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

      <Text fontSize="xs" color="gray.500" textAlign="center" maxW="600px">
        By subscribing, you agree to our Terms of Service and Privacy Policy.
        You can cancel your subscription at any time in account settings.
      </Text>
    </VStack>
  );
};

export default PricingSelector;
