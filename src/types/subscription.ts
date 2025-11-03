// Subscription-related type definitions

export type BillingInterval = "day" | "week" | "month" | "year" | null;

export interface PricingTier {
  price_id: string;
  nickname: string;
  unit_amount: number; // in cents
  currency: string; // e.g. 'aud'
  interval: BillingInterval; // nullable from API
  interval_count: number | null;
  // optional extras if you add them later
  price?: number;
  id?: string;
  description?: string;
  trial_days?: number | null;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  default_price_id: string | null;
  prices: PricingTier[];
  metadata?: Record<string, string>;
  marketing_features?: string[];
}

export interface ProductsPricingResponse {
  products: Product[];
}

export interface CheckoutSessionRequest {
  price_id: string;
  user_type: string;
  opportunity_id: number;
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
  | "incomplete_expired"
  | "unpaid"
  | "paused"
  | null;

export interface SubscriptionStatusResponse {
  has_access: boolean;
  status: SubscriptionStatus;
  current_period_end?: string;
  cancel_at_period_end?: boolean;
  trial_end?: string;
  active_override?: string;
  access_source?: string;
}
