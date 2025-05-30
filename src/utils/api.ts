//const BASE_URL = process.env.NEXT_PUBLIC_API_URL
const BASE_URL = 'http://localhost:8000'

export const API_ENDPOINTS = {
  LOGIN: `${BASE_URL}/api/v1/login`,
  SIGNUP: `${BASE_URL}/api/v1/signup`,
  PASSWORD_RESET: `${BASE_URL}/api/v1/password-reset-request`,
  //USER_TYPES: `${process.env.NEXT_PUBLIC_API_URL}/api/v1/user-types`,
  USER_TYPES: `${BASE_URL}/api/v1/user-types`,
}