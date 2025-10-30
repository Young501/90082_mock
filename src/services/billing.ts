import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  ProductsPricingResponse,
  CheckoutSessionRequest,
  CheckoutSessionResponse,
  SubscriptionStatusResponse,
} from "@/types/subscription";

/**
 * Hook to fetch product pricing for an opportunity
 */
export function useProductPricing(
  opportunityId: string | number | null,
  userType: string | null,
  options?: { enabled?: boolean }
) {
  return useQuery<ProductsPricingResponse | null>({
    queryKey: ["products-pricing", opportunityId, userType],
    queryFn: async () => {
      if (!opportunityId || !userType) return null;

      try {
        const response = await apiRequest<ProductsPricingResponse>({
          endpoint: API_ENDPOINTS.PRODUCT_PRICING,
          params: {
            opportunity_id: Number(opportunityId),
            user_type: userType,
          },
        });
        return response;
      } catch (error: any) {
        if (error?.response?.status === 404) return null;
        throw error;
      }
    },
    // by default auto-fetches when both params exist
    enabled: options?.enabled ?? (!!opportunityId && !!userType),
    retry: false,
    staleTime: 5 * 60 * 1000,
    select: (data) => {
      if (!data) return null;
      // ensure empty list means free access
      return data.products?.length ? data : null;
    },
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

export function useSubscriptionStatus(
  opportunityParticipantId: string | number | null
) {
  console.warn(
    "useSubscriptionStatus is deprecated. Use useOpportunityParticipant instead."
  );

  return useQuery<SubscriptionStatusResponse | null>({
    queryKey: ["subscription-status-deprecated", opportunityParticipantId],
    queryFn: async () => {
      // Return null to indicate no subscription status (free access)
      return null;
    },
    enabled: false, // Disabled to prevent API calls
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
