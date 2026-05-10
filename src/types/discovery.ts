import { Organisation } from "./shared";

export interface FilterFormData {
  [key: string]: any;
}

export interface ProcessedField {
  field: string;
  type: string;
  label: string;
  filter_label?: string;
  options?: string[] | Array<{ label: string; value: string }>;
  uniqueKey: string;
  dependencyChain: DependencyCondition[];
  displayHint?: string;
  source?: "onboarding" | "questionnaire";
}

export interface DependencyCondition {
  field: string;
  value: string;
  operator?: "equals" | "contains" | "not_equals";
}

export interface UniversityLink {
  label: string;
  url: string;
}

export interface StudentProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  location?: string;
  distance_km?: number;
  profile_picture_url?: string | null;
  degree?: string;
  course_stream?: {
    id?: number;
    code?: string;
    label?: string;
  };
  specialisations?: string[] | string;
  progression?: string;
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
  status?: "International" | string;
  faculty?: string;
  resume_url?: string;
  resume?: string;
  bio?: string;
  preferred_distance_km?: number;
  skills_text?: string;
  specialisations_other?: string;
  credentials_text?: string;
  opportunity_title?: string;
  questionnaire_answers?: Record<string, any>;
  matched?: boolean;
  match_score?: number;
  folder_member_id?: number;
  university?: {
    id?: number;
    name?: string;
    logo_url?: string;
    links?: UniversityLink[];
  };
}

export interface OrganisationProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  organisation?: Organisation;
  location?: string;
  distance_km?: number;
  profile_picture_url?: string | null;
  name?: string;
  sector?: string;
  industry?: string;
  company_size?: string;
  logo_url?: string | null;
  availability?: string;
  abn_acn?: string;
  is_alum?: boolean;
  university_name?: string;
  employment_type?: string;
  degree?: string;
  about?: string;
  logo?: string | null;
  profile_picture?: string | null;
  website?: string;
  linkedin?: string;
  instagram?: string;
  bluesky?: string;
  discovery_pools?: string;
  faculty?: string;
  user?: number;
  questionnaire_answers?: Record<string, any>;
  allow_contact?: boolean;
  contact_email?: string;
  description?: string;
  matchPercentage?: number;
  match_score?: number;
  folder_member_id?: number;
  members?: {
    id?: number;
    first_name?: string;
    last_name?: string;
    profile_picture_url?: string | null;
    role?: string;
    job_title?: string;
  }[];
}
