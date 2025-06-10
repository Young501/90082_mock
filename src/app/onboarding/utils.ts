// src/utils/onboarding.ts

import { apiClient } from '@/api';
import { User } from '@/app/types/user';
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

  if (user.user_types.length > 1) {
    console.log('User has multiple user types, assuming profile exists');
    return { status: 'multiple_user_types' };
  }

  if (!userType) {
    return { status: 'error', error: 'No user type found' };
  }

  try {
    await apiClient.get(`/api/v1/${userType}`);
    console.log('User profile exists, no onboarding needed');
    return { status: 'has_profile' };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      console.log('User profile not found, needs onboarding');
      return { status: 'needs_onboarding' };
    }

    const errorMessage = error instanceof Error
      ? `Error checking onboarding profile: ${error.message}`
      : 'Error checking onboarding profile (unknown error)';

    console.error(errorMessage);
    return {
      status: 'error',
      error: errorMessage
    };
  }
};

export const checkOnboardingStatusWithPromise = (
  user: User,
  token: string
): Promise<OnboardingResult> => {
  console.log('Checking onboarding status for user:', user.id);

  const userType = user?.user_types?.[0];

  if (user.user_types.length > 1) {
    console.log('User has multiple user types, assuming profile exists');
    return Promise.resolve({ status: 'multiple_user_types' });
  }

  if (!userType) {
    return Promise.resolve({ status: 'error', error: 'No user type found' });
  }

  return apiClient.get(`/api/v1/${userType}`)
    .then(() => {
      console.log('User profile exists, no onboarding needed');
      return { status: 'has_profile' as const };
    })
    .catch(error => {
      if (error instanceof Error && error.message.includes('404')) {
        console.log('User profile not found, needs onboarding');
        return { status: 'needs_onboarding' as const };
      }

      const errorMessage = error instanceof Error
        ? `Error checking onboarding profile: ${error.message}`
        : 'Error checking onboarding profile (unknown error)';

      console.error(errorMessage);
      return {
        status: 'error' as const,
        error: errorMessage
      };
    });
};

export const submitOnboardingAnswers = async (
  answers: AnswerMap,
  userType: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  if (!token) {
    return { success: false, error: 'No access token found.' };
  }

  try {
    await apiClient.post(`/api/v1/${userType}`, answers);
    return { success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};

export const submitOnboardingAnswersWithPromise = (
  answers: AnswerMap,
  userType: string,
  token: string
): Promise<{ success: boolean; error?: string }> => {
  if (!token) {
    return Promise.resolve({ success: false, error: 'No access token found.' });
  }

  return apiClient.post(`/api/v1/${userType}`, answers)
    .then(() => ({ success: true }))
    .catch(error => {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: errorMessage };
    });
};