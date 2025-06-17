import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { User } from "@/app/types/user";
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

export const apiClient = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  // headers: {
  //   'Content-Type': 'application/json',
  // },
});

const isAuthRequiredEndpoint = (url: string): boolean => {
  const authEndpoints = [
    "/api/v1/student",
    "/api/v1/teacher",
    "/api/v1/employer",
    "/api/v1/university",
    "/api/v1/user-profile",
    "/api/v1/onboarding",
    "/api/v1/logout",
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
    console.error("❌ Request interceptor error:", error);
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
  auth?: boolean;
};

export const API_ENDPOINTS = {
  LOGIN: {
    method: "POST",
    url: "/api/v1/login",
    auth: false,
  },
  SIGNUP: {
    method: "POST",
    url: "/api/v1/signup",
    auth: false,
  },
  LOGOUT: {
    method: "POST",
    url: "/api/v1/logout",
    auth: true,
  },
  PASSWORD_RESET: {
    method: "POST",
    url: "/api/v1/password-reset-request",
    auth: false,
  },
  USER_TYPES: {
    method: "GET",
    url: "/api/v1/user-types",
    auth: false,
  },
  ONBOARDING_PAGES: (userType: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/user-types/${userType}/onboarding-pages/`,
    auth: false,
  }),
  ONBOARDING_SUBMISSION: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}`,
    auth: true,
  }),
  USER_PROFILE: (userType: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/${userType}`,
    auth: true,
  }),
  FILE_UPLOAD: (endpoint: string): ApiEndpoint => ({
    method: "POST",
    url: `${BASE_URL}/api/v1${endpoint}`,
    auth: true,
  }),
};

type ApiRequestParams = {
  endpoint: ApiEndpoint;
  body?: object | FormData;
  token?: string;
  headers?: Record<string, string>;
};

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

// ============= REACT QUERY HOOKS =============

interface LoginData {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
  user_types: string[];
}

interface PasswordResetData {
  email: string;
}

export function loginMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: LoginData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.LOGIN,
        body: data,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useSignup() {
  return useMutation({
    mutationFn: async (data: SignupData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.SIGNUP,
        body: data,
      });
    },
  });
}

export function usePasswordReset() {
  return useMutation({
    mutationFn: async (data: PasswordResetData) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.PASSWORD_RESET,
        body: data,
      });
    },
  });
}

export function useUserTypes() {
  return useQuery({
    queryKey: ["user-types"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.USER_TYPES }),
    staleTime: 10 * 60 * 1000,
  });
}

export function useOnboardingPages(userType: string) {
  return useQuery({
    queryKey: ["onboarding-pages", userType],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ONBOARDING_PAGES(userType) }),
    enabled: !!userType,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserProfile(userType: string) {
  return useQuery({
    queryKey: ["user-profile", userType],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.USER_PROFILE(userType),
      }),
    enabled: !!userType,
    retry: (failureCount, error) => {
      if (error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useOnboardingSubmission(userType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ONBOARDING_SUBMISSION(userType),
        body: answers,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["user-profile", userType],
      });
    },
  });
}
