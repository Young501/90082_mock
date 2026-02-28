export interface OnboardingPage {
  title: string;
  short_title?: string;
  [key: string]: any;
}

export interface OnboardingData {
  onboarding_pages: {
    schema_version?: string;
    student_onboarding?: OnboardingPage[];
    organisation_onboarding?: OnboardingPage[];
    organisation_member_onboarding?: OnboardingPage[];
    // Legacy format
    user?: OnboardingPage[];
    organisation?: OnboardingPage[];
  };
}

export interface Tab {
  title: string;
  icon: string;
}
