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
