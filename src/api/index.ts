import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { useAuthStore } from "@/store";
import { ApiEndpoint, ApiRequestParams } from "@/types/api";
import { User } from "@/types/user";

const getCurrentToken = (): string | null => {
  return useAuthStore.getState().getCurrentToken();
};

/*****
 * Matches invite pattern to avoid breaking opportunity invite if user is not logged in so on 401 we exclude invite pages since redrirect is already handled in component
 */

const matchesInvitePattern = (url: string): boolean => {
  try {
    const urlObj = new URL(url, window.location.origin);

    if (urlObj.pathname !== "/invite/") return false;

    const params = urlObj.searchParams;
    return params.has("token") && params.has("opportunity");
  } catch {
    return false;
  }
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
      const headersObj =
        typeof (config.headers as any)?.toJSON === "function"
          ? (config.headers as any).toJSON()
          : (config.headers as any);

      const safeHeaders = headersObj?.Authorization
        ? { ...headersObj, Authorization: "[HIDDEN]" }
        : headersObj;

      const qs =
        config.params &&
        new URLSearchParams(config.params as Record<string, string>).toString();
      const fullUrl = `${config.baseURL ?? ""}${config.url}${qs ? `?${qs}` : ""}`;

      console.log(`🚀 ${config.method?.toUpperCase()} ${fullUrl}`, {
        params: config.params,
        data: config.data,
        headers: safeHeaders,
      });
    }
    return config;
  },
  (error: AxiosError) => {
    // [BJ] Breaks opportunity invite if user is not logged in
    const currentUrl = window.location.href;
    const isInvitePage = matchesInvitePattern(currentUrl);

    if (error.status === 401 && !isInvitePage) {
      useAuthStore.getState().logout();
      window.location.href = "/login/";
    }
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
    // [BJ] Breaks opportunity invite if user is not logged in
    const currentUrl = window.location.href;
    const isInvitePage = matchesInvitePattern(currentUrl);

    // TODO: clean up after testing on staging
    console.log("isInvitePage", isInvitePage);
    console.log("error.status", currentUrl);

    if (error.status === 401 && !isInvitePage) {
      useAuthStore.getState().logout();
      // window.location.href = "/login/";
    }
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
  PASSWORD_RESET_CONFIRM: {
    method: "POST",
    url: "/api/v1/reset-password/",
  },
  EMAIL_VERIFICATION: {
    method: "GET",
    url: "/api/v1/verify-email/",
  },
  USER_TYPES: {
    method: "GET",
    url: "/api/v1/user-types",
  },
  ACCEPTED_OPPORTUNITIES: {
    method: "GET",
    url: "/api/v1/opportunities/accepted/",
  },
  USERS_SEARCH: {
    method: "GET",
    url: "/api/v1/users/search/",
    auth: true,
  },
  PROFILE_PICTURE_UPLOAD: {
    method: "POST",
    url: "/api/v1/user/profile-picture",
  },
  ONBOARDING_PAGES: (userType: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/user-types/${userType}/onboarding-pages/`,
  }),
  ONBOARDING_SUBMISSION: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}`,
  }),
  PROFILE_UPDATE: (userType: string): ApiEndpoint => ({
    method: "PUT",
    url: `/api/v1/${userType}`,
  }),
  USER_PROFILE: (userType: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/${userType}`,
  }),
  RESUME_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-resume`,
  }),
  LOGO_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-logo`,
  }),
  STUDENT_PROFILE: (id: string, opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/student/${id}?opportunity_id=${opportunityId}`,
  }),
  PARTNER_PROFILE: (id: string, opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/organisation/${id}?opportunity_id=${opportunityId}`,
  }),
  OPPORTUNITY_DETAIL: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/`,
  }),
  INVITE_ACCEPT: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/accept/`,
  }),
  FOLDERS: {
    method: "GET",
    url: "/api/v1/folders/",
  },
  CREATE_FOLDER: {
    method: "POST",
    url: "/api/v1/folders/",
  },
  FOLDER_DETAIL: (folderId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/folders/${folderId}/`,
  }),
  UPDATE_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "PUT",
    url: `/api/v1/folders/${folderId}/`,
  }),
  DELETE_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v1/folders/${folderId}/`,
  }),
  CHANGE_PASSWORD: {
    method: "POST",
    url: "/api/v1/change-password/",
  },
  ADD_MEMBER_TO_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/folders/${folderId}/member/`,
  }),
  REMOVE_MEMBER_FROM_FOLDER: (
    folderId: string,
    userId: string
  ): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v1/folders/${folderId}/member/${userId}/`,
  }),
  FOLDER_MEMBERS: (folderId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/folders/${folderId}/members/`,
  }),
  // v2 opportunities endpoints
  COORDINATOR_OPPORTUNITIES: {
    method: "GET",
    url: "/api/v2/opportunities/coordinator/all/",
  },
  ALL_OPPORTUNITIES: {
    method: "GET",
    url: "/api/v2/opportunities/all/",
  },
  OPPORTUNITY_PARTICIPANT: (opportunity_id: number): ApiEndpoint => ({
    method: "GET",
    url: `/api/v2/opportunities/${opportunity_id}/participant/`,
  }),
  UPDATE_OPPORTUNITY_PARTICIPANT: (opportunity_id: number): ApiEndpoint => ({
    method: "PATCH",
    url: `/api/v2/opportunities/${opportunity_id}/participant/`,
  }),
  CANCEL_OPPORTUNITY_ENROLLMENT: (opportunity_id: number): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v2/opportunities/${opportunity_id}/participant/`,
  }),
  OPPORTUNITY_ENROLLMENT: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/opportunities/${opportunityId}/participant/`,
  }),
  CONTACT_USER: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/contact/`,
  }),
  QUESTIONNAIRE_FILTERS: (
    opportunityId: string,
    userType: string
  ): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/questionnaire-filters/?user_type=${userType}`,
  }),
  OPPORTUNITY_DASHBOARD: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/dashboard/`,
  }),
  OPPORTUNITY_PARTICIPANTS: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/participants/`,
  }),
  MATCH: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/match/`,
  }),
  UNMATCH: (opportunityId: string, matchId: string): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v1/opportunities/${opportunityId}/match/${matchId}/`,
  }),
  GEOCODE: {
    method: "POST",
    url: "/api/v1/geocode/",
  },
  INVITE_PARTICIPANTS: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/invite/`,
  }),
  ORGANISATION_CHECK_DOMAIN: {
    method: "GET",
    url: "/api/v1/organisation/check-domain/",
  },
  ORGANISATION_DETAIL: (id: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/organisation/${id}/`,
  }),
  COORDINATOR_VIEW_USER_PROFILE: (
    participantId: string,
    opportunityId: string
  ): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/participant/${participantId}/`,
  }),
  // Subscription endpoints
  SUBSCRIPTION_STATUS: {
    method: "GET",
    url: "/subscription/api/v1/status/",
  },
  SUBSCRIPTION_CANCEL: {
    method: "POST",
    url: "/subscription/api/v1/cancel/",
  },
};

/*********
 * apiRequest for making mutations with token guided endpoints
 */
export async function apiRequest<T = any>({
  endpoint,
  body,
  headers = {},
  params,
}: ApiRequestParams): Promise<T> {
  const { method, url } = endpoint;

  const config = {
    method: method.toLowerCase() as "get" | "post" | "put" | "delete",
    url,
    headers: {
      ...headers,
    },
    ...(body ? { data: body } : {}),
    ...(params ? { params } : {}),
  };

  const response = await apiClient.request(config);
  return response.data;
}
