export type User = {
  id?: string;
  email?: string;
  user_types: string[];
};

export interface UserProfile {
  id: number;
  first_name: string;
  last_name: string;
  resume_url: string;
  profile_picture_url: string;
  profile_picture: string;
  location: string;
  homepage: string;
  linkedin: string;
  instagram: string;
  bluesky: string;
  status: "International" | string;
  faculty: string;
  course_name: string;
  course_stream: string;
  specialization: string[];
  course_progression: string;
  skills: string[];
  credentials: string[];
  discovery_pools: string;
  position_type: string;
  preferred_location: string[];
  within_distance_km: string;
  resume: string;
  user: number;
  // Partner specific
  logo_url: string;
  company_name: string;
  abn_acn: string;
  is_alum: boolean;
  university_name: string;
  employment_type: string;
  degree: string;
  sector: string;
  industry: string;
  company_size: string;
  about: string;
  logo: string;
}
