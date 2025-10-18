"use client";

import React from "react";
import { Box, Alert, VStack, HStack, Text, Badge } from "@chakra-ui/react";
import { AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import { SubscriptionStatusResponse } from "@/types/subscription";

interface SubscriptionGateProps {
  children: React.ReactNode;
  subscriptionStatus: SubscriptionStatusResponse | null | undefined;
  isLoadingStatus: boolean;
  requiresSubscription: boolean;
  opportunityId?: string;
  showAccessBanner?: boolean;
}

/**
 * Component to wrap content that requires subscription access
 * Displays different UI based on subscription status
 */
export const SubscriptionGate: React.FC<SubscriptionGateProps> = ({
  children,
  subscriptionStatus,
  isLoadingStatus,
  requiresSubscription,
  opportunityId,
  showAccessBanner = true,
}) => {
  const router = useRouter();

  // If subscription not required, render children directly
  if (!requiresSubscription) {
    return <>{children}</>;
  }

  // If loading status, show loading
  if (isLoadingStatus) {
    return <>{children}</>; // Allow content display to avoid flashing
  }

  const status = subscriptionStatus?.status;

  // Active subscription - full access
  if (status === "active") {
    return (
      <>
        {showAccessBanner && subscriptionStatus?.current_period_end && (
          <Alert.Root status="success" mb={4}>
            <Alert.Indicator />
            <Alert.Description>
              Subscription valid until{" "}
              {new Date(
                subscriptionStatus.current_period_end
              ).toLocaleDateString("en-US")}
            </Alert.Description>
          </Alert.Root>
        )}
        {children}
      </>
    );
  }

  // Trial period - treat as full access (no restrictions)
  if (status === "trialing") {
    return (
      <>
        {showAccessBanner && (
          <Alert.Root status="success" mb={4}>
            <Alert.Indicator />
            <Alert.Description>
              Subscription active - full access granted
            </Alert.Description>
          </Alert.Root>
        )}
        {children}
      </>
    );
  }

  // Canceled but still within valid period
  if (
    status === "canceled" &&
    subscriptionStatus?.current_period_end &&
    new Date(subscriptionStatus.current_period_end) > new Date()
  ) {
    return (
      <>
        {showAccessBanner && (
          <Alert.Root status="warning" mb={4}>
            <Alert.Indicator />
            <Alert.Description>
              Subscription canceled. Access available until{" "}
              {new Date(
                subscriptionStatus.current_period_end
              ).toLocaleDateString("en-US")}
            </Alert.Description>
          </Alert.Root>
        )}
        {children}
      </>
    );
  }

  // Expired, past due, or incomplete - block access
  if (
    !status ||
    status === "expired" ||
    status === "past_due" ||
    status === "incomplete" ||
    (status === "canceled" &&
      subscriptionStatus?.current_period_end &&
      new Date(subscriptionStatus.current_period_end) <= new Date())
  ) {
    return (
      <Box textAlign="center" py={12}>
        <VStack gap={6} maxW="600px" mx="auto">
          <Box
            w={20}
            h={20}
            borderRadius="full"
            bg="orange.50"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Lock size={40} color="#DD6B20" />
          </Box>

          <VStack gap={2}>
            <Text fontSize="2xl" fontWeight="bold">
              Subscription Required
            </Text>
            <Text color="gray.600" fontSize="lg">
              {status === "expired" || status === "canceled"
                ? "Your subscription has expired"
                : status === "past_due"
                  ? "Your payment is past due, please update payment method"
                  : "This opportunity requires an active subscription to access"}
            </Text>
          </VStack>

          <Alert.Root status="warning" maxW="500px">
            <Alert.Indicator />
            <Alert.Description>
              Subscribe to this opportunity to explore and connect with students
              or partners. Choose the plan that works best for you.
            </Alert.Description>
          </Alert.Root>

          {opportunityId && (
            <Button
              size="lg"
              colorScheme="blue"
              onClick={() =>
                router.push(`/opportunities/pricing?id=${opportunityId}`)
              }
            >
              View Subscription Plans
            </Button>
          )}
        </VStack>
      </Box>
    );
  }

  // Default - show children
  return <>{children}</>;
};

/**
 * Helper function to check if full profile viewing is allowed
 */
export function canViewFullProfile(
  subscriptionStatus: SubscriptionStatusResponse | null | undefined,
  requiresSubscription: boolean
): {
  canView: boolean;
  reason?: string;
} {
  if (!requiresSubscription) {
    return { canView: true };
  }

  const status = subscriptionStatus?.status;

  // Active subscription can view
  if (status === "active") {
    return { canView: true };
  }

  // Canceled but still within valid period can view
  if (
    status === "canceled" &&
    subscriptionStatus?.current_period_end &&
    new Date(subscriptionStatus.current_period_end) > new Date()
  ) {
    return { canView: true };
  }

  // Trial period can view full profiles (no restrictions)
  if (status === "trialing") {
    return { canView: true };
  }

  // All other statuses cannot view
  return {
    canView: false,
    reason: "Active subscription required to view full profiles.",
  };
}
