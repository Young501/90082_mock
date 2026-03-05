import { StudentProfile, OrganisationProfile } from "./discovery";

export type UserProfile = StudentProfile &
  OrganisationProfile & {
    organisation?: Organisation;
  };

export interface OrganisationMember {
  id: number;
  full_name?: string;
  profile_picture_url?: string | null;
  job_title?: string;
  first_name?: string;
  last_name?: string;
}

export interface Organisation {
  id?: number;
  name?: string;
  logo_url?: string;
  description?: string;
  email_domain?: string;
  sector?: string;
  industry?: string;
  location?: string;
  website?: string;
  instagram?: string;
  linkedin?: string;
  abn_acn?: string;
  allow_contact?: boolean;
  company_size?: string;
  created_at?: string;
  contact_email?: string;
  member_count?: number;
  members?: OrganisationMember[];
}

export interface OrganisationCheckResponse {
  organisation: Organisation | null;
  message: string | null;
}

export interface OrganisationInvite {
  organisation: Organisation;
  platform_role: string;
  invited_by_email: string;
  expires_at: string;
  will_replace_current_membership?: boolean;
  current_organisation?: {
    organisation: Organisation;
  };
}

export interface UserSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}

export interface GeocodeResult {
  id: number;
  formatted_address: string;
  latitude: string;
  longitude: string;
  subpremise?: string;
  premise?: string;
  street_number?: string;
  route?: string;
  neighborhood?: string;
  sublocality?: string;
  locality?: string;
  postal_code?: string;
  administrative_area_level_2?: string;
  administrative_area_level_1?: string;
  country?: string;
}

export interface AbnValidationResponse {
  valid: boolean;
  matchedName?: string | null;
}

export interface TaxonomyQueryParams {
  type: string;
    parent?: string | null;
  university?: string | null | "dynamic";
}

export interface TaxonomyNode {
  id: number;
  type: string;
  code: string;
  label: string;
  university?: string | null;
  parent?: string | null;
}
