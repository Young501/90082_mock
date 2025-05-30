const BASE_URL = process.env.NEXT_PUBLIC_API_URL
export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/v1/login`,
  SIGNUP: `${BASE_URL}/api/v1/signup`,
  PASSWORD_RESET: `${BASE_URL}/api/v1/password-reset-request`,
  USER_TYPES: `${BASE_URL}/api/v1/user-types`,
  ONBOARDING_PAGES: (userType: string) => `${BASE_URL}/api/v1/user-types/${userType}/onboarding-pages/`,
  ONBOARDING_SUBMISSION: (userType: string) => `${BASE_URL}/api/v1/${userType}`,
  USER_PROFILE: (userType: string) => `${BASE_URL}/api/v1/${userType}`
}