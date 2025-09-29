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
  user_type_key: string;
  participant_id: number;
  email: string;
  accepted: boolean;
  type: string;
  data: {
    // User profile data
    id: number;
    first_name: string;
    last_name: string;
    email?: string;
    location?: string;
    profile_picture_url?: string;
    course_name?: string;
    course_stream?: string;
    course_progression?: string;
    specialization?: string[];
    skills?: string[];
    credentials?: string[];
    preferred_location?: string[];
    availability?: string;
    discovery_pools?: string;
    position_type?: string;
    within_distance_km?: string;
    homepage?: string;
    linkedin?: string;
    instagram?: string;
    bluesky?: string;
    status?: string;
    faculty?: string;
    resume_url?: string;
    questionnaire_answers?: Record<string, any>;
    matched?: boolean;
    user?: number;
  };
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
