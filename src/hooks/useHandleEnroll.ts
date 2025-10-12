import { useAuthStore } from "@/store";
import { useEnrollInOpportunity } from "@/services/updateParticipant";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductPricing } from "@/services/billing";

const hasContent = (val: unknown) => {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val as object).length > 0;
  return true;
};

export function useHandleEnroll({
  isEligible,
  opportunityId,
  opportunity,
  toast,
}: {
  isEligible: boolean | null | undefined;
  opportunityId: string;
  opportunity: { questionnaire?: Record<string, unknown> } | null | undefined;
  toast: {
    success: (m: string) => void;
    warning: (m: string) => void;
    error: (m: string) => void;
  };
}) {
  const { user } = useAuthStore();
  const router = useRouter();
  const enrollMutation = useEnrollInOpportunity();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingPricing, setIsCheckingPricing] = useState(false);
  const clickedRef = useRef(false);

  const userType = user?.user_types?.[0];
  const qForType = useMemo(
    () => opportunity?.questionnaire?.[userType as string],
    [opportunity?.questionnaire, userType]
  );
  const shouldShowQuestionnaire = hasContent(qForType);

  // Fetch pricing data (but don't auto-fetch until needed)
  const { data: pricingData, refetch: checkPricing } = useProductPricing(
    null, // Initially null to prevent auto-fetching
    null
  );

  const handleEnroll = useCallback(async () => {
    if (clickedRef.current) return;
    clickedRef.current = true;
    setIsSubmitting(true);

    try {
      if (isEligible === false) {
        toast.warning("This opportunity is not available for your university.");
        return;
      }

      if (!userType) {
        toast.warning(
          "We couldn't detect your user type. Please re-login or contact support."
        );
        return;
      }

      // Check if feature flag to bypass paywall (dev only)
      const urlParams = new URLSearchParams(window.location.search);
      const bypassPaywall = urlParams.get("paywall") === "off";

      // Step 1: Check for pricing (unless bypassed)
      if (!bypassPaywall) {
        setIsCheckingPricing(true);

        try {
          // Manually fetch pricing
          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/subscription/api/v1/product-pricing/?opportunity_id=${opportunityId}&user_type=${userType}`,
            {
              headers: {
                Authorization: `Token ${useAuthStore.getState().getCurrentToken()}`,
              },
            }
          );

          if (response.ok) {
            const pricing = await response.json();

            // If pricing exists and has prices, redirect to pricing selector
            if (pricing?.prices && pricing.prices.length > 0) {
              const nextParam = shouldShowQuestionnaire
                ? "&next=questionnaire"
                : "";
              router.push(
                `/opportunities/pricing?id=${opportunityId}${nextParam}`
              );
              return;
            }
          } else if (response.status !== 404) {
            // Handle non-404 errors
            throw new Error("Failed to fetch pricing information");
          }
          // 404 or empty prices = free access, continue
        } catch (pricingError: any) {
          console.error("Pricing check error:", pricingError);
          // If pricing check fails, we'll continue with free enrollment
          // but show a warning
          if (pricingError?.message !== "Failed to fetch pricing information") {
            toast.warning(
              "Unable to verify pricing information, continuing with free enrollment."
            );
          } else {
            throw pricingError;
          }
        } finally {
          setIsCheckingPricing(false);
        }
      }

      // Step 2: If no pricing or free access, proceed to questionnaire or direct enrollment
      if (shouldShowQuestionnaire) {
        router.push(`/opportunities/start?id=${opportunityId}`);
        return;
      }

      await enrollMutation.mutateAsync({ opportunityId });
      toast.success("Enrollment successful!");
      //   router.replace(`/opportunities/complete?id=${opportunityId}`);
    } catch (err: any) {
      toast.error(err?.message ?? "Enrollment failed. Please try again.");
      clickedRef.current = false; // allow retry on error
    } finally {
      setIsSubmitting(false);
      setIsCheckingPricing(false);
    }
  }, [
    isEligible,
    opportunityId,
    userType,
    shouldShowQuestionnaire,
    router,
    enrollMutation,
    toast,
  ]);

  return {
    handleEnroll,
    isSubmitting: isSubmitting || isCheckingPricing,
  };
}
