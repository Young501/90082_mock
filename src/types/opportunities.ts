import { Question } from "./onboarding";

export interface OpportunityCoordinator {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
}

export interface EnrollmentPreviewContent {
  heading: string;
  benefits: string[];
}

export interface EnrollmentPreview {
  student?: EnrollmentPreviewContent;
  organisation?: EnrollmentPreviewContent;
}

export interface OpportunityUniversity {
  id?: number;
  name?: string;
  slug?: string;
  logo_url?: string;
  links?: { url: string; label: string }[];
}

export interface Opportunity {
  id: number;
  public_id?: string;
  title: string;
  description: string;
  logo_url?: string;
  start_date: string;
  end_date: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questionnaire: Record<string, Question[]>;
  allowed_student_email_domains?: string[];
  is_enrolled?: boolean;
  participant_record?: ParticipantRecord | null;
  enrollment_status?: "enrolled" | "not_enrolled" | string;
  is_default?: boolean;
  is_hidden?: boolean;
  links?: { url: string; label: string }[];
  enrollment_preview?: EnrollmentPreview | null;
  coordinator?: OpportunityCoordinator | null;
  university?: OpportunityUniversity | null;
}

export interface ParticipantRecord {
  id?: number;
  status?: string;
  accepted?: boolean;
  created_at?: string;
  updated_at?: string;
  [key: string]: any;
}

export interface OpportunitiesResponse {
  results: Opportunity[];
  count: number;
  next: string | null;
  previous: string | null;
}

export interface OpportunitiesMap {
  [key: number]: Opportunity;
}

export interface CategorizedOpportunities {
  enrolled: Opportunity[];
  closed: Opportunity[];
}

export interface AccessibleOpportunity extends Opportunity {
  enrollment_status: "enrolled" | "not_enrolled" | string;
  visibility_display: string;
  access: AccessInfo;
  slug: string;
}

export type AccessSource = "none" | "rule" | "override" | "subscription";
export type NextAction = "none" | "subscribe"; // add "start_trial" if you enable it later

export interface AccessOverrideInfo {
  id: number;
  reason: string;
  end: string; // ISO datetime
}

export interface SubscriptionInfo {
  id: string; // Stripe sub id
  status:
    | "incomplete"
    | "incomplete_expired"
    | "trialing"
    | "active"
    | "past_due"
    | "canceled"
    | "unpaid"
    | "paused";
  current_period_end: string | null; // ISO
  cancel_at_period_end: boolean;
  trial_end: string | null; // ISO
}

export interface TrialEligibility {
  eligible: boolean;
  days_total: number;
}

export interface AccessInfo {
  has_access: boolean;
  access_source: AccessSource;
  requires_subscription: boolean;

  trial_eligibility: TrialEligibility | null;
  subscription: SubscriptionInfo | null;
  active_override: AccessOverrideInfo | null;

  entitlement_expires_at: string | null; // ISO
  next_action: NextAction;
}

export interface OpportunityParticipantResponse {
  user_type_key: string;
  participant_id: number;
  email: string;
  accepted: boolean;
  type: string;
  data: string;
  access: AccessInfo;
}
