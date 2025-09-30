import { useAuthStore } from "@/store";
import { useEnrollInOpportunity } from "@/services/updateParticipant";
import { useCallback, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

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
  const clickedRef = useRef(false);

  const userType = user?.user_types?.[0];
  const qForType = useMemo(
    () => opportunity?.questionnaire?.[userType as string],
    [opportunity?.questionnaire, userType]
  );
  const shouldShowQuestionnaire = hasContent(qForType);

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

  return { handleEnroll, isSubmitting };
}
