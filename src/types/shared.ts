import { StudentProfile, PartnerProfile } from "./discovery";

export type UserProfile = StudentProfile & PartnerProfile;

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
