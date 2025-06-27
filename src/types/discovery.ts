export interface FilterFormData {
  [key: string]: any;
}

export interface ProcessedField {
  field: string;
  type: string;
  label: string;
  options?: string[];
  uniqueKey: string;
  dependencyChain: DependencyCondition[];
  displayHint?: string;
}

export interface DependencyCondition {
  field: string;
  value: string;
  operator?: "equals" | "contains" | "not_equals";
}

export interface StudentProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  location?: string;
  profile_picture_url?: string;
  course_name?: string;
  course_stream?: string;
  specialization?: string[] | string;
  course_progression?: string;
  skills?: string[];
  credentials?: string[];
  preferred_location?: string[];
}

export interface PartnerProfile {
  id?: number;
  first_name?: string;
  last_name?: string;
  location?: string;
  profile_picture_url?: string;
  company_name?: string;
  sector?: string;
  industry?: string;
  company_size?: string;
  logo_url?: string;
  email?: string;
  availability?: string;
}

export type UserProfile = StudentProfile | PartnerProfile;

export interface UserSearchParams {
  user_type: string;
  page?: number;
  page_size?: number;
  [key: string]: any;
}

export interface UserSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}
