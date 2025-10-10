import { Question } from "./onboarding";

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
  questionnaire: Record<string, Question[]>;
  allowed_student_email_domains?: string[];
  is_enrolled?: boolean;
  participant_record?: ParticipantRecord | null;
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
