const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const API_ENDPOINTS = {
  LOGIN: {
    method: 'POST',
    url: `${BASE_URL}/api/v1/login`,
    auth: false,
  },
  SIGNUP: {
    method: 'POST',
    url: `${BASE_URL}/api/v1/signup`,
    auth: false,
  },
  PASSWORD_RESET: {
    method: 'POST',
    url: `${BASE_URL}/api/v1/password-reset-request`,
    auth: false,
  },
  USER_TYPES: {
    method: 'GET',
    url: `${BASE_URL}/api/v1/user-types`,
    auth: false,
  },
  ONBOARDING_PAGES: (userType: string) => ({
    method: 'GET',
    url: `${BASE_URL}/api/v1/user-types/${userType}/onboarding-pages/`,
    auth: false,
  }),
  ONBOARDING_SUBMISSION: (userType: string) => ({
    method: 'POST',
    url: `${BASE_URL}/api/v1/${userType}`,
    auth: true,
  }),
  USER_PROFILE: (userType: string) => ({
    method: 'GET',
    url: `${BASE_URL}/api/v1/${userType}`,
    auth: true,
  }),
};