// Subscription-related type definitions

export interface Product {
  id: string;
  name: string;
  description: string;
}

export interface PricingTier {
  interval: "month" | "year";
  interval_count: number;
  price_id: string;
  unit_amount: number;
  currency: string;
}

export interface ProductPricingResponse {
  product: Product;
  prices: PricingTier[];
}

export interface CheckoutSessionRequest {
  opportunity_id: number;
  opportunity_participant_id?: number;
  user_type: string;
  interval: "month" | "year";
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
  cancel_at_period_end?: boolean;
}

export interface SubscriptionAccessGate {
  hasAccess: boolean;
  status: SubscriptionStatus;
  message?: string;
  showUpgradePrompt?: boolean;
  expirationDate?: string;
}
