import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user";
import { UserSearchParams, UserSearchResponse } from "@/types/discovery";
import { useAuthStore } from "@/store";

// ============= AUTH UTILITIES =============

export interface AuthData {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

export const getAuthData = (): AuthData => {
  const { user, token, isAuthenticated } = useAuthStore.getState();
  return { user, token, isAuthenticated };
};

export const logout = (): void => {
  useAuthStore.getState().logout();
};

export const setUserType = (userType: string): void => {
  useAuthStore.getState().setUserType(userType);
};

export const getCurrentUser = (): User | null => {
  return useAuthStore.getState().getCurrentUser();
};

export const getCurrentToken = (): string | null => {
  return useAuthStore.getState().getCurrentToken();
};

export const getUserType = (): string | undefined => {
  return useAuthStore.getState().getUserType();
};

export const useAuth = (): AuthData => {
  const { user, token, isAuthenticated } = useAuthStore();
  return { user, token, isAuthenticated };
};

// ============= AXIOS CONFIG =============

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

/*********
 * apiClient for making requests directly to the API root layer no token necessity interceptors not present
 */
export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

const isAuthRequiredEndpoint = (url: string): boolean => {
  const authEndpoints = [
    "/api/v1/student",
    "/api/v1/partner",
    "/api/v1/logout",
    "/api/v1/users/search",
  ];

  return authEndpoints.some((endpoint) => url.includes(endpoint));
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCurrentToken();

    if (token && config.url && isAuthRequiredEndpoint(config.url)) {
      if (config.headers) {
        config.headers.Authorization = `Token ${token}`;
      }
    }

    if (process.env.NODE_ENV === "development") {
      console.log(`🚀 ${config.method?.toUpperCase()} ${config.url}`, {
        data: config.data,
        headers: config.headers?.Authorization
          ? { ...config.headers, Authorization: "[HIDDEN]" }
          : config.headers,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    // console.error("❌ Request interceptor error:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    if (process.env.NODE_ENV === "development") {
      console.log(
        `✅ ${response.config.method?.toUpperCase()} ${response.config.url}`,
        {
          status: response.status,
          data: response.data,
        }
      );
    }
    return response;
  },
  (error: AxiosError) => {
    if (process.env.NODE_ENV === "development") {
      console.error(
        `❌ ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
        {
          status: error.response?.status,
          data: error.response?.data,
        }
      );
    }
    return Promise.reject(error);
  }
);

// ============= API ENDPOINTS =============

type ApiEndpoint = {
  method: string;
  url: string;
};

export const API_ENDPOINTS = {
  LOGIN: {
    method: "POST",
    url: "/api/v1/login",
  },
  SIGNUP: {
    method: "POST",
    url: "/api/v1/signup",
  },
  LOGOUT: {
    method: "POST",
    url: "/api/v1/logout",
  },
  PASSWORD_RESET: {
    method: "POST",
    url: "/api/v1/password-reset-request",
  },
  EMAIL_VERIFICATION: {
    method: "GET",
    url: "/api/v1/verify-email/",
  },
  USER_TYPES: {
    method: "GET",
    url: "/api/v1/user-types",
  },
  USERS_SEARCH: {
    method: "GET",
    url: "/api/v1/users/search",
    auth: true,
  },
  ONBOARDING_PAGES: (userType: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/user-types/${userType}/onboarding-pages/`,
  }),
  ONBOARDING_SUBMISSION: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}`,
  }),
  USER_PROFILE: (userType: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/${userType}`,
  }),
  FILE_UPLOAD: (endpoint: string): ApiEndpoint => ({
    method: "POST",
    url: `${BASE_URL}/api/v1${endpoint}`,
  }),
  PROFILE_PICTURE_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-picture`,
  }),
  RESUME_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-resume`,
  }),
};

type ApiRequestParams = {
  endpoint: ApiEndpoint;
  body?: object | FormData;
  token?: string;
  headers?: Record<string, string>;
};

/*********
 * apiRequest for making mutations with token guided endpoints
 */
export async function apiRequest({
  endpoint,
  body,
  token,
  headers = {},
}: ApiRequestParams): Promise<any> {
  const { method, url } = endpoint;

  const config = {
    method: method.toLowerCase() as "get" | "post" | "put" | "delete",
    url,
    headers,
    ...(body ? { data: body } : {}),
  };

  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }

  const response = await apiClient.request(config);
  return response.data;
}
