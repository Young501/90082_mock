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
  Link,
} from "@chakra-ui/react";
import { Button } from "@/components/ui/Button";
import { PricingTier, Product } from "@/types/subscription";
import { CheckCircle, Loader, XCircle } from "lucide-react";
import { formatPrice } from "@/utils/formatPrice";
import { useAuthStore } from "@/store";

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
  const { user } = useAuthStore();
  const userType = user?.user_types?.[0];
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

  const pricingOptions: Array<{
    product: Product;
    price: PricingTier;
    isRecommended: boolean;
  }> = [];

  sortedProducts.forEach((product) => {
    const isRecommended = product.metadata?.recommended === "true";
    // Sort prices by billing interval in order
    const sortedPrices = product.prices.slice().sort((a, b) => {
      const intervalOrder: Record<string, number> = {
        year: 1,
        month: 2,
        week: 3,
        day: 4,
      };

      const aInterval = a.interval || "month";
      const bInterval = b.interval || "month";

      // should interval be unknown then default to 999
      return (
        (intervalOrder[aInterval] || 999) - (intervalOrder[bInterval] || 999)
      );
    });

    sortedPrices.forEach((price) => {
      pricingOptions.push({
        product,
        price,
        isRecommended,
      });
    });
  });

  return (
    <VStack gap={6} w="100%" mx="auto" p={6}>
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
        columns={{
          base: 1,
          md: 2,
          lg: pricingOptions.length === 3 ? 3 : 2,
          xl: pricingOptions.length === 3 ? 3 : 4,
        }}
        gap={6}
        w="100%"
        justifyContent="center"
        alignItems="center"
      >
        {pricingOptions.map(({ product, price, isRecommended }) => {
          const isDefaultPrice = price.price_id === product.default_price_id;
          const showRecommendedBadge = isRecommended && isDefaultPrice;

          const getIntervalLabel = (
            interval: string,
            intervalCount: number
          ) => {
            if (intervalCount === 1) {
              return interval === "year" ? "year" : interval;
            }
            return `${intervalCount} ${interval}${intervalCount > 1 ? "s" : ""}`;
          };

          return (
            <Card.Root
              key={`${product.id}-${price.price_id}`}
              p={6}
              borderWidth={2}
              borderColor={showRecommendedBadge ? "green.500" : "gray.200"}
              position="relative"
              _hover={{
                borderColor: showRecommendedBadge ? "green.600" : "gray.300",
                transform: "translateY(-4px)",
                shadow: "lg",
              }}
              transition="all 0.2s"
              display="flex"
              flexDirection="column"
            >
              {showRecommendedBadge && (
                <Badge
                  bg="green.600"
                  color="white"
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

              <VStack align="stretch" gap={6} flexGrow={1}>
                <VStack align="flex-start" gap={1}>
                  <Text
                    fontSize="xl"
                    fontWeight="bold"
                    textTransform="uppercase"
                    color="gray.600"
                  >
                    {product.name}
                  </Text>
                  {price.nickname && (
                    <Text fontSize="md" color="gray.500" fontWeight="medium">
                      {price.nickname}
                    </Text>
                  )}
                  <HStack align="baseline" gap={2}>
                    <Text fontSize="4xl" fontWeight="bold">
                      {formatPrice(price.unit_amount, price.currency)}
                    </Text>
                    <Text color="gray.500">
                      /{" "}
                      {getIntervalLabel(
                        price.interval || "month",
                        price.interval_count || 1
                      )}
                    </Text>
                  </HStack>
                  {trialDays > 0 && (
                    <Badge
                      borderRadius="full"
                      border="1px solid #000000"
                      px={2}
                      py={1}
                      boxShadow="0 0 10px 0 rgba(0, 0, 0, 0.1)"
                    >
                      Includes {trialDays}-day free trial
                    </Badge>
                  )}
                </VStack>

                <Box h="100px">
                  {product.description && (
                    <Text color="gray.600" fontSize="sm">
                      {product.description}
                    </Text>
                  )}
                </Box>

                {product.marketing_features &&
                  product.marketing_features.length > 0 && (
                    <FeatureList features={product.marketing_features} />
                  )}
              </VStack>

              <Box mt={8}>
                <Button
                  size="lg"
                  w="100%"
                  onClick={() => {
                    setLoadingPriceId(price.price_id);
                    onSubscribeClick(price);
                  }}
                  isLoading={isLoading && loadingPriceId === price.price_id}
                  disabled={isLoading}
                >
                  Subscribe Now
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
        By subscribing, you agree to our{" "}
        <Link target="_blank" href={`/legal/terms-${userType}`}>
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link target="_blank" href="/legal/privacy">
          Privacy Policy
        </Link>
        . You can cancel your subscription at any time in account settings.
      </Text>
    </VStack>
  );
};

export default PricingSelector;
