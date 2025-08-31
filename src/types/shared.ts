import { StudentProfile, OrganisationProfile } from "./discovery";

export type UserProfile = StudentProfile &
  OrganisationProfile & {
    organisation?: Organisation;
  };

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
}

export interface tempOrganisationUser {
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string | null;
}

export interface OrganisationCheckResponse {
  organisation: Organisation | null;
  message: string | null;
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
