// src/utils/onboarding.ts

import { User } from '@/types/user';
import { API_ENDPOINTS, apiRequest } from '@/utils/api';
import { AnswerValue, Question } from './OnboardingContext';

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
    const profileRes = await apiRequest({
      endpoint: API_ENDPOINTS.USER_PROFILE(userType),
      token: token
    });

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


const uploadFile = async (file: File, endpoint: string, token: string): Promise<boolean> => {
  const formData = new FormData();
  formData.append('file', file);

  try {
    const response = await apiRequest({
      endpoint: API_ENDPOINTS.FILE_UPLOAD(endpoint),
      token: token,
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text(); // Or use response.json() if you expect JSON
      console.error(`Upload failed: ${response.status} ${response.statusText}`);
      console.error('Error body:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('File upload failed:', error);
    return false;
  }
};

export const submitOnboardingAnswers = async (
  answers: AnswerMap,
  userType: string,
  token: string,
  allQuestions: Question[]
): Promise<{ success: boolean; error?: string }> => {
  if (!token) {
    return { success: false, error: 'No access token found.' };
  }

  try {
    // profile must exist before uploading files.
    const profileData = Object.fromEntries(
      Object.entries(answers).filter(([_, value]) => !(value instanceof File))
    );

    const res = await apiRequest({
      endpoint: API_ENDPOINTS.ONBOARDING_SUBMISSION(userType),
      token: token,
      body: profileData
    });

    if (!res.ok) {
      const text = await res.text();
      return { success: false, error: text };
    }

    for (const [field, value] of Object.entries(answers)) {
      if (value instanceof File) {
        const question = allQuestions.find(q => q.field === field);
        if (question?.upload_endpoint) {
          const uploadSuccess = await uploadFile(value, question.upload_endpoint, token);
          if (!uploadSuccess) {
            return { success: false, error: `Failed to upload ${question.label}` };
          }
        }
      }
    }

    return { success: true };
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error';
    return { success: false, error: errorMessage };
  }
};