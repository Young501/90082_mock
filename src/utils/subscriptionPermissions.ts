import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/formatDate";

export const isInTrialPeriod = (opportunitySlug: string): boolean => {
  const trialInfo = getSubscriptionTrialInfo(opportunitySlug);
  return trialInfo.isInTrial;
};

export const getSubscriptionTrialInfo = (
  opportunitySlug: string
): {
  isInTrial: boolean;
  trialEnd: string | null;
} => {
  const { accessibleOpportunities } = useAuthStore.getState();

  if (!opportunitySlug || !accessibleOpportunities) {
    return { isInTrial: false, trialEnd: null };
  }

  const currentOpportunitySubscriptionInfo = accessibleOpportunities.find(
    (opp) => opp.slug === opportunitySlug
  )?.access?.subscription;

  if (!currentOpportunitySubscriptionInfo) {
    return { isInTrial: false, trialEnd: null };
  }

  return {
    isInTrial: currentOpportunitySubscriptionInfo.status === "trialing",
    trialEnd: currentOpportunitySubscriptionInfo.trial_end,
  };
};

export const getSubscriptionStatusDisplay = (
  has_access: boolean | false,
  subStatus: string | undefined,
  cancelAtPeriodEnd: boolean | undefined,
  currentPeriodEnd: string | null | undefined,
  trialEnd: string | null | undefined
) => {
  const getActiveDate = () => {
    if (trialEnd && subStatus === "trialing") {
      return formatDate(trialEnd);
    }
    return formatDate(currentPeriodEnd || "");
  };

  if (!subStatus) {
    if (!has_access) {
      return {
        icon: "🔴",
        label: `Requires Subscription`,
        colorScheme: "red",
      };
    } else return null;
  }
  if (
    (subStatus === "active" || subStatus === "trialing") &&
    cancelAtPeriodEnd
  ) {
    return {
      icon: "🟠",
      label: `Canceled — access until ${getActiveDate()}`,
      colorScheme: "orange",
    };
  }

  switch (subStatus) {
    case "active":
      return {
        icon: "🟢",
        label: `Active — renews on ${getActiveDate()}`,
        colorScheme: "green",
      };

    case "trialing":
      return {
        icon: "🟢",
        label: `Trial ends on ${getActiveDate()}`,
        colorScheme: "yellow",
      };
    case "canceled":
      return {
        icon: "🔴",
        label: currentPeriodEnd
          ? `Canceled — access until ${formatDate(currentPeriodEnd)}`
          : "Canceled",
        colorScheme: "red",
      };
    case "past_due":
      return {
        icon: "🟠",
        label: "Past Due — update payment",
        colorScheme: "orange",
      };
    case "incomplete":
    case "incomplete_expired":
      return {
        icon: "⚪",
        label: "Incomplete",
        colorScheme: "gray",
      };
    case "unpaid":
      return {
        icon: "🔴",
        label: "Unpaid",
        colorScheme: "red",
      };
    default:
      return null;
  }
};
