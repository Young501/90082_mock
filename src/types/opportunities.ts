export interface Opportunity {
  id: number;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  created_by: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  questionnaire?: Record<string, any>;
  // Enrollment status from API
  is_enrolled?: boolean;
  participant_record?: ParticipantRecord;
}

export interface ParticipantRecord {
  id: number;
  opportunity_id?: number;
  user_id?: number;
  email?: string;
  user_type_key?: string;
  user_type_name?: string;
  accepted?: boolean;
  invited_time?: string;
  participant_name?: string;
  questionnaire_answers?: Record<string, any>;
  status_display?: string;
  status?: "active" | "inactive" | "pending";
  enrolled_at?: string;
  created_at?: string;
  updated_at?: string;
}

export interface OpportunitiesResponse {
  opportunities: Opportunity[];
  total_count: number;
}

export interface OpportunitiesMap {
  [opportunityId: number]: Opportunity;
}

export interface CategorizedOpportunities {
  enrolled: Opportunity[];
  closed: Opportunity[];
}

export type OpportunityStatus = "enrolled" | "closed";
