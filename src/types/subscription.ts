// Subscription-related type definitions

export interface PricingTier {
  id: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  description?: string;
  trial_days?: number;
}

export interface ProductPricingResponse {
  opportunity_id: number;
  user_type: string;
  prices: PricingTier[];
}

export interface CheckoutSessionRequest {
  opportunity_id: number;
  opportunity_participant_id?: number;
  user_type: string;
  interval: "month" | "year";
  trial_days?: number;
}

export interface CheckoutSessionResponse {
  url: string;
  session_id?: string;
}

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "past_due"
  | "expired"
  | "incomplete"
  | null;

export interface SubscriptionStatusResponse {
  opportunity_participant_id: number;
  status: SubscriptionStatus;
  current_period_end?: string;
  trial_end?: string;
  cancel_at_period_end?: boolean;
}

export interface SubscriptionAccessGate {
  hasAccess: boolean;
  status: SubscriptionStatus;
  message?: string;
  showUpgradePrompt?: boolean;
  expirationDate?: string;
}
