export interface OnboardingPage {
  title: string;
  short_title?: string;
  [key: string]: any;
}

export interface OnboardingData {
  onboarding_pages: {
    user?: OnboardingPage[];
    organisation?: OnboardingPage[];
  };
}

export interface Tab {
  title: string;
  icon: string;
}

