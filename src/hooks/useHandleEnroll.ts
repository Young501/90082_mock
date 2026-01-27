import { useAuthStore } from "@/store";
import { useEnrollInOpportunity } from "@/services/updateParticipant";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useProductPricing } from "@/services/billing";
import { AccessInfo } from "@/types/opportunities";

const hasContent = (val: unknown) => {
  if (!val) return false;
  if (Array.isArray(val)) return val.length > 0;
  if (typeof val === "object") return Object.keys(val as object).length > 0;
  return true;
};

type Props = {
  isEligible: boolean | null | undefined;
  opportunityId: string;
  opportunity: { questionnaire?: Record<string, unknown> } | null | undefined;
  accessInfo: AccessInfo | null | undefined;
  toast: {
    success: (m: string) => void;
    warning: (m: string) => void;
    error: (m: string) => void;
  };
  opportunitySlug?: string;
};

const STRIPE_PRICING_ENABLED = false; // [BJ] use this flag to turn back on stripe pricing flow
const UNIMELB_SUBSCRIPTION_URL =
  "https://ecommerce.unimelb.edu.au/uniconnected-subscription";

export function useHandleEnroll({
  isEligible,
  opportunityId,
  opportunity,
  accessInfo,
  toast,
  opportunitySlug,
}: Props) {
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

  // Keep params, but do not auto-fetch
  const { refetch: refetchPricing } = useProductPricing(
    opportunityId,
    userType || null,
    { enabled: false }
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

      if (accessInfo?.next_action === "subscribe") {
        if (!STRIPE_PRICING_ENABLED) {
          window.location.href = UNIMELB_SUBSCRIPTION_URL;
          return;
        }

        // Step 1: Check for pricing
        setIsCheckingPricing(true);
        let hasPaidPricing = false;
        try {
          const res = await refetchPricing();
          const pricing = (res as any)?.data ?? res;
          hasPaidPricing = Boolean(
            pricing?.products?.some(
              (p: any) => Array.isArray(p.prices) && p.prices.length > 0
            )
          );
        } catch (e: any) {
          console.error("Pricing check error:", e);
          toast.warning(
            "Unable to verify pricing information, continuing with free enrollment."
          );
        } finally {
          setIsCheckingPricing(false);
        }

        // If paid, send user to pricing selector
        if (hasPaidPricing) {
          const nextParam = shouldShowQuestionnaire
            ? "&next=questionnaire"
            : "";
          router.push(
            `/opportunities/pricing?opp=${opportunitySlug}${nextParam}`
          );
          return;
        }
      }

      // Step 2: If no pricing or free access, proceed to questionnaire or direct enrollment
      if (shouldShowQuestionnaire) {
        router.push(`/opportunities/start?opp=${opportunitySlug}`);
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
    refetchPricing,
    accessInfo,
    opportunitySlug,
  ]);

  return {
    handleEnroll,
    isSubmitting: isSubmitting || isCheckingPricing,
  };
}
