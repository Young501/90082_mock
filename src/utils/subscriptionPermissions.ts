
import { useAuthStore } from "@/store/authStore";

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

export const isSubscriptionExpired = (): boolean => {
  const subscriptionStatus = useAuthStore.getState().subscriptionStatus;
  return subscriptionStatus === "expired";
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
  const { currentOpportunityId, accessibleOpportunities } = useAuthStore.getState();
  
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