const BASE_URL = process.env.NEXT_PUBLIC_API_URL
export const API_ENDPOINTS = {
  USER_TYPES: `${BASE_URL}/api/v1/user-types`,
  ONBOARDING_PAGES: (userType: string) => `${BASE_URL}/api/v1/user-types/${userType}/onboarding-pages/`,
}