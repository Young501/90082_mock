export interface Folder {
  id: number;
  name: string;
  description: string | null;
  member_count: number;
  created_at: string;
  updated_at: string;
}

export interface FolderDetail extends Folder {
  members: FolderMember[];
  opportunity_slug: string;
}

export interface CreateFolderRequest {
  opportunity: string; // opportunity slug
  name: string;
  description?: string;
}

export interface UpdateFolderRequest {
  name?: string;
  description?: string;
}

export interface StudentMemberProfile {
  id: number;
  first_name: string;
  last_name: string;
  profile_picture_url: string | null;
  degree: string | null;
  course_stream: string | null;
  specialisations: string | null;
  progression: string | null;
  skills: string[];
  credentials: string[];
  preferred_location: string | null;
  questionnaire_answers: Record<string, any>;
  matched: boolean;
  location: any;
  distance_km: number | null;
}

export interface OrganisationMemberProfile {
  id: number;
  name: string;
  logo_url: string | null;
  industry: string | null;
  website: string | null;
}

export interface FolderMember {
  id: number;
  member_type: "student" | "organisation";
  profile: StudentMemberProfile | OrganisationMemberProfile | null;
  added_at: string;
}

export interface AddMemberToFolderRequest {
  user_id?: number;
  organisation_id?: number;
}

export interface FolderMembersResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FolderMember[];
}

export interface AddMemberToFolderResponse {
  detail: string;
  member: FolderMember;
  member_count: number;
}
