export interface ProfileCompletionItem {
  key: string;
  label: string;
  completed: boolean;
}

export interface HomepageProfile {
  logo_url: string | null;
  organisation_name?: string;
  profile_picture_url?: string | null;
  name?: string;
  course_name?: string;
  course_progression?: string;
  abn?: string;
  skills?: string[];
  completion_items: ProfileCompletionItem[];
}

export interface HomepageOpportunityAccess {
  has_access: boolean;
  access_source: string;
  requires_subscription: boolean;
  trial_eligibility: unknown;
  subscription: unknown;
  active_override: unknown;
  entitlement_expires_at: string | null;
  next_action: string;
}

export interface HomepageOpportunityLink {
  url: string;
  label: string;
}

export interface HomepageOpportunity {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: number;
  is_active: boolean;
  visibility: number;
  visibility_display: string;
  slug: string;
  enrollment_status?: string;
  access?: HomepageOpportunityAccess;
  is_default?: boolean;
  links?: HomepageOpportunityLink[];
  [key: string]: unknown;
}

export interface HomepageMessageSender {
  id: number;
  email: string;
  full_name: string;
  profile_picture_url: string | null;
  organisation_name?: string | null;
  organisation_logo_url?: string | null;
}

export interface HomepageLastMessage {
  id: number;
  sender: HomepageMessageSender;
  content: string;
  created_at: string;
  is_soft_deleted: boolean;
}

export interface HomepageOtherUser {
  id: number;
  email: string;
  full_name: string;
  profile_picture_url: string | null;
  organisation_name: string | null;
  organisation_logo_url: string | null;
}

export interface HomepageRecentMessage {
  id: number;
  other_user: HomepageOtherUser;
  opportunity_id: number | null;
  opportunity_title: string | null;
  last_message: HomepageLastMessage;
  last_message_at: string;
  has_unread: boolean;
  unread_count: number;
  is_archived: boolean;
  created_at: string;
}

export interface HomepageTeamMember {
  id: number;
  full_name: string;
  email: string;
  role?: string;
  job_title?: string;
  profile_picture_url?: string | null;
  member_since?: string;
}

export interface HomepageStats {
  user_type: "organisation" | "student";
  profile: HomepageProfile;
  opportunities: HomepageOpportunity[];
  recent_messages: HomepageRecentMessage[];
  team_members?: HomepageTeamMember[];
}
