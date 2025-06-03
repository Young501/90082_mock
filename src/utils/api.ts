const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

type ApiEndpoint = {
  method: string;
  url: string;
  auth?: boolean;
};

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
  ONBOARDING_PAGES: (userType: string):ApiEndpoint => ({
    method: 'GET',
    url: `${BASE_URL}/api/v1/user-types/${userType}/onboarding-pages/`,
    auth: false,
  }),
  ONBOARDING_SUBMISSION: (userType: string):ApiEndpoint => ({
    method: 'POST',
    url: `${BASE_URL}/api/v1/${userType}`,
    auth: true,
  }),
  USER_PROFILE: (userType: string):ApiEndpoint => ({
    method: 'GET',
    url: `${BASE_URL}/api/v1/${userType}`,
    auth: true,
  }),
};


type ApiRequestParams = {
  endpoint: ApiEndpoint;
  body?: object;
  token?: string;
  headers?: Record<string, string>;
};


export async function apiRequest({
  endpoint,
  body,
  token,
  headers = {},
}: ApiRequestParams): Promise<Response> {
  const { method, url, auth } = endpoint;

  const reqHeaders: Record<string, string> = {
    ...headers,
    ...(auth && token ? { Authorization: `Token ${token}` } : {}),
    ...(body ? { 'Content-Type': 'application/json' } : {}),
  };

  return fetch(url, {
    method,
    headers: reqHeaders,
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}