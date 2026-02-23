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
};
