// src/utils/onboarding.ts

import { User } from '@/types/user';
import { API_ENDPOINTS } from '@/utils/api';
import { apiRequest } from '@/utils/apiRequest';
import { AnswerValue } from './OnboardingContext';

export type OnboardingStatus =
  | 'needs_onboarding'
  | 'has_profile'
  | 'multiple_user_types'
  | 'error';

export interface OnboardingResult {
  status: OnboardingStatus;
  error?: string;
}

type AnswerMap = {
  [field: string]: AnswerValue;
};

export const checkOnboardingStatus = async (
  user: User,
  token: string
): Promise<OnboardingResult> => {
  console.log('Checking onboarding status for user:', user.id);

  const userType = user?.user_types?.[0];

  // If user has more than one user type, assume they have at least 1 completed profile
  if (user.user_types.length > 1) {
    console.log('User has multiple user types, assuming profile exists');
    return { status: 'multiple_user_types' };
  }

  try {
    const { method, url, auth } = API_ENDPOINTS.USER_PROFILE(userType);
    const profileRes = await apiRequest({ method, url, auth, token });

    if (profileRes.status === 404) {
      console.log('User profile not found, needs onboarding');
      return { status: 'needs_onboarding' };
    } else {
      console.log('User profile exists, no onboarding needed');
      return { status: 'has_profile' };
    }
  } catch (err) {
    const errorMessage = err instanceof Error
      ? `Error checking onboarding profile: ${err.message}`
      : 'Error checking onboarding profile (unknown error)';

    console.error(errorMessage);
    return {
      status: 'error',
      error: errorMessage
    };
  }
}

export const submitOnboardingAnswers = async (
  answers: AnswerMap,
  userType: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  if (!token) {
    return { success: false, error: 'No access token found.' };
  }

  try {
    const { method, url, auth } = API_ENDPOINTS.ONBOARDING_SUBMISSION(userType);
    const res = await apiRequest({
      method,
      url,
      auth,
      token,
      body: answers
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};