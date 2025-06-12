// src/utils/onboarding.ts

import { User } from '@/types/user';
import { AnswerValue, Question } from './OnboardingContext';
import { uploadFile } from '@/utils/fileUpload';
import { API_ENDPOINTS, apiClient, apiRequest } from '@/api';

export type OnboardingStatus =
    | "needs_onboarding"
    | "has_profile"
    | "multiple_user_types"
    | "error"

export interface OnboardingResult {
    status: OnboardingStatus
    error?: string
}

type AnswerMap = {
    [field: string]: AnswerValue
}

export const checkOnboardingStatus = async (
    user: User,
    token: string
): Promise<OnboardingResult> => {
    console.log("Checking onboarding status for user:", user.id)

    const userType = user?.user_types?.[0]

    if (user.user_types.length > 1) {
        console.log("User has multiple user types, assuming profile exists")
        return { status: "multiple_user_types" }
    }

    if (!userType) {
        return { status: "error", error: "No user type found" }
    }

    try {
        await apiClient.get(API_ENDPOINTS.USER_PROFILE(userType).url)
        console.log("User profile exists, no onboarding needed")
        return { status: "has_profile" }
    } catch (error: any) {
        if (error.response?.status === 404) {
            console.log("User profile not found, needs onboarding")
            return { status: "needs_onboarding" }
        }
        return {
            status: "error",
            error: `Error checking onboarding profile: ${error.message}`,
        }
    }
}

export const checkOnboardingStatusWithPromise = (
    user: User,
    token: string
): Promise<OnboardingResult> => {
    console.log("Checking onboarding status for user:", user.id)

    const userType = user?.user_types?.[0]

    if (user.user_types.length > 1) {
        console.log("User has multiple user types, assuming profile exists")
        return Promise.resolve({ status: "multiple_user_types" })
    }

    if (!userType) {
        return Promise.resolve({ status: "error", error: "No user type found" })
    }

    return apiClient
        .get(`/api/v1/${userType}`)
        .then((res) => {
            console.log("res", res)
            console.log("User profile exists, no onboarding needed")
            return { status: "has_profile" as const }
        })
        .catch((error) => {
            if (error instanceof Error && error.message.includes("404")) {
                console.log("User profile not found, needs onboarding")
                return { status: "needs_onboarding" as const }
            }

            const errorMessage =
                error instanceof Error
                    ? `Error checking onboarding profile: ${error.message}`
                    : "Error checking onboarding profile (unknown error)"

            console.error(errorMessage)
            return {
                status: "error" as const,
                error: errorMessage,
            }
        })
}

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
      try {
        const errorData = await res.json();
        const errorMessage = errorData.error || errorData.detail || 'Failed to create profile';
        return { success: false, error: errorMessage };
      } catch {
        return { success: false, error: 'Failed to create profile' };
      }
    }

    const failedUploads: string[] = [];

    for (const [field, value] of Object.entries(answers)) {
      if (value instanceof File) {
        const question = allQuestions.find(q => q.field === field);
        if (question?.upload_endpoint) {
          const result = await uploadFile(value, question.upload_endpoint, token);
          if (!result.success) {
            failedUploads.push(`${question.label}: ${result.error}`);
          }
        }
      }
    }

    if (failedUploads.length > 0) {
      const errorMsg = [
        'Profile created successfully, but some files failed to upload:',
        '',
        failedUploads.join('\n'),
        '',
        'You can upload these files later in your profile page.'
      ].join('\n');
      return { success: true, error: errorMsg };
    }

    return { success: true };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
  }
};
