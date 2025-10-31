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

  const has_access = true; //subscriptionStatus?.has_access;
  const status = "active";
  //subscriptionStatus?.status;

  // Active subscription - full access
  if (has_access && status === "active") {
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
  if (has_access && status === "trialing") {
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
};
