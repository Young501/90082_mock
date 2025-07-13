import { StudentProfile, PartnerProfile } from "./discovery";

export type UserProfile = StudentProfile | PartnerProfile;

export interface UserSearchResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserProfile[];
}
