export interface OnboardingPage {
  title: string;
  short_title?: string;
  [key: string]: any;
}

export interface OnboardingData {
  onboarding_pages: OnboardingPage[];
}

export interface UserProfile {
  first_name?: string;
  last_name?: string;
  location?: string;
  faculty?: string;
  course_name?: string;
  skills?: string[];
  credentials?: string[];
  profile_picture_url?: string;
  [key: string]: any;
}

export interface Tab {
  title: string;
  icon: string;
}
