import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  ProductPricingResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  SubscriptionStatusResponse,
} from "@/types/subscription";

/**
 * Hook to fetch product pricing for an opportunity
 */
export function useProductPricing(
  opportunityId: string | number | null,
  userType: string | null
) {
  return useQuery<ProductPricingResponse | null>({
    queryKey: ["product-pricing", opportunityId, userType],
    queryFn: async () => {
      if (!opportunityId || !userType) return null;

      try {
        const response = await apiRequest<ProductPricingResponse>({
          endpoint: API_ENDPOINTS.PRODUCT_PRICING,
          params: {
            opportunity_id: Number(opportunityId),
            user_type: userType,
          },
        });
        return response;
      } catch (error: any) {
        // If 404 or no pricing, return null to indicate free access
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!opportunityId && !!userType,
    retry: false,
  });
}

/**
 * Hook to create a checkout session
 */
export function useCreateCheckoutSession() {
  return useMutation<CheckoutSessionResponse, Error, CheckoutSessionRequest>({
    mutationFn: async (data) => {
      const response = await apiRequest<CheckoutSessionResponse>({
        endpoint: API_ENDPOINTS.CHECKOUT_SESSION,
        body: data,
      });
      return response;
    },
  });
}

/**
 * Hook to fetch subscription status
 */
export function useSubscriptionStatus(
  opportunityParticipantId: string | number | null
) {
  return useQuery<SubscriptionStatusResponse | null>({
    queryKey: ["subscription-status", opportunityParticipantId],
    queryFn: async () => {
      if (!opportunityParticipantId) return null;

      try {
        const response = await apiRequest<SubscriptionStatusResponse>({
          endpoint: API_ENDPOINTS.SUBSCRIPTION_STATUS,
          params: {
            opportunity_participant_id: opportunityParticipantId,
          },
        });
        return response;
      } catch (error: any) {
        // If no subscription record found, return null
        if (error?.response?.status === 404) {
          return null;
        }
        throw error;
      }
    },
    enabled: !!opportunityParticipantId,
    retry: false,
  });
}

/**
 * Helper function to determine access based on subscription status
 */
export function getSubscriptionAccess(
  status: SubscriptionStatusResponse | null,
  requiresSubscription: boolean
): {
  hasAccess: boolean;
  canViewFullProfile: boolean;
  message?: string;
  showUpgradePrompt?: boolean;
  expirationDate?: string;
} {
  // If subscription not required, allow full access
  if (!requiresSubscription) {
    return {
      hasAccess: true,
      canViewFullProfile: true,
    };
  }

  // If no subscription status, block access
  if (!status || !status.status) {
    return {
      hasAccess: false,
      canViewFullProfile: false,
      message: "Subscription required to access this opportunity",
      showUpgradePrompt: true,
    };
  }

  switch (status.status) {
    case "active":
      return {
        hasAccess: true,
        canViewFullProfile: true,
      };

    case "trialing":
      return {
        hasAccess: true,
        canViewFullProfile: true,
        message: "Subscription active - full access granted",
        showUpgradePrompt: false,
      };

    case "canceled":
      // If within current period, still allow access
      if (status.current_period_end) {
        const periodEnd = new Date(status.current_period_end);
        const now = new Date();
        if (periodEnd > now) {
          return {
            hasAccess: true,
            canViewFullProfile: true,
            message: `Subscription expires on ${periodEnd.toLocaleDateString("en-US")}`,
            expirationDate: status.current_period_end,
          };
        }
      }
      // Already expired
      return {
        hasAccess: false,
        canViewFullProfile: false,
        message: "Subscription expired. Please resubscribe to continue access",
        showUpgradePrompt: true,
      };

    case "past_due":
    case "expired":
      return {
        hasAccess: false,
        canViewFullProfile: false,
        message:
          "Subscription expired or past due. Please update payment method",
        showUpgradePrompt: true,
      };

    case "incomplete":
      return {
        hasAccess: false,
        canViewFullProfile: false,
        message: "Subscription incomplete. Please complete payment",
        showUpgradePrompt: true,
      };

    default:
      return {
        hasAccess: false,
        canViewFullProfile: false,
        message: "Unable to determine subscription status",
        showUpgradePrompt: true,
      };
  }
}
