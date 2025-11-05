import { useAuthStore } from "@/store/authStore";
import { formatDate } from "@/utils/formatDate";

export const isInTrialPeriod = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "trialing";
};

export const isSubscriptionActive = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "active";
};

export const isSubscriptionCanceled = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "canceled";
};

export const isSubscriptionPastDue = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "past_due";
};

export const isSubscriptionIncomplete = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "incomplete";
};

export const isSubscriptionIncompleteExpired = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "incomplete_expired";
};

export const isSubscriptionUnpaid = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "unpaid";
};

export const isSubscriptionPaused = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "paused";
};

export const getSubscriptionTrialInfo = (): {
  isInTrial: boolean;
  trialEnd: string | null;
} => {
  const { currentOpportunityId, accessibleOpportunities } =
    useAuthStore.getState();

  if (!currentOpportunityId || !accessibleOpportunities) {
    return { isInTrial: false, trialEnd: null };
  }

  const currentOpportunity = accessibleOpportunities.find(
    (opp) => opp.id === Number(currentOpportunityId)
  );

  if (!currentOpportunity?.access?.subscription) {
    return { isInTrial: false, trialEnd: null };
  }

  const { status, trial_end } = currentOpportunity.access.subscription;

  return {
    isInTrial: status === "trialing",
    trialEnd: trial_end,
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
