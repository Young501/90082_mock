import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store";
import { ApiEndpoint, ApiRequestParams } from "@/types/api";

const getCurrentToken = (): string | null => {
  return useAuthStore.getState().getCurrentToken();
};

// ============= AXIOS CONFIG =============

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/*********
 * apiClient for making requests directly to the API root layer no token necessity interceptors not present
 */
const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getCurrentToken();

    if (token) {
      config.headers.Authorization = `Token ${token}`;
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
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Request interceptor error:", error);
    }
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
  PROFILE_PICTURE_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-picture`,
  }),
  RESUME_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-resume`,
  }),
  LOGO_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-logo`,
  }),
  OPPORTUNITY_DETAIL: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/`,
  }),
  INVITE_ACCEPT: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/accept/`,
  }),
};

/*********
 * apiRequest for making mutations with token guided endpoints
 */
export async function apiRequest<T = any>({
  endpoint,
  body,
  headers = {},
}: ApiRequestParams): Promise<T> {
  const { method, url } = endpoint;

  const config = {
    method: method.toLowerCase() as "get" | "post" | "put" | "delete",
    url,
    headers: {
      ...headers,
    },
    ...(body ? { data: body } : {}),
  };

  const response = await apiClient.request(config);
  return response.data;
}
