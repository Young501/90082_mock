/** ***************************************
 * Response from /api/v2/users/me/
 * May be returned in login response later for auth store to avoid reduncancy
 * *************************************** */
export type UserDetailsV2 = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture?: string;
  profile_picture_url?: string;
  location?: {
    id: number;
    formatted_address: string;
    latitude: string;
    longitude: string;
  };
  email_verified?: boolean;
  user_types: Array<{ key: string; name: string }>;
  last_seen_at?: string;
};

export type User = {
  id?: string;
  email?: string;
  user_types: string[];
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string;
  university?: {
    name?: string;
    slug?: string;
    logo_url?: string;
    links?: Record<string, string>;
  };
  userDetailsV2?: UserDetailsV2;
};

