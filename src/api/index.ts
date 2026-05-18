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
export const apiClient = axios.create({
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
  PROFILE_PICTURE_UPLOAD: {
    method: "POST",
    url: "/api/v1/user/profile-picture",
  },
  PROFILE_PICTURE_DELETE: {
    method: "DELETE",
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
  // v2 Profiles & User APIs (Schema 2.0.0)
  STUDENT_PROFILE_V2: {
    method: "GET",
    url: "/api/v2/profiles/student/me/",
  },
  ORGANISATION_PROFILE_V2: {
    method: "GET",
    url: "/api/v2/profiles/organisation/me/",
  },
  ORGANISATION_PROFILE_CREATE_V2: {
    method: "POST",
    url: "/api/v2/profiles/organisation/me/",
  },
  ORGANISATION_PROFILE_UPDATE_V2: {
    method: "PATCH",
    url: "/api/v2/profiles/organisation/me/",
  },
  ORGANISATION_MEMBER_ME_V2: {
    method: "GET",
    url: "/api/v2/profiles/organisation/member/me/",
  },
  ORGANISATION_MEMBER_ME_UPDATE_V2: {
    method: "PATCH",
    url: "/api/v2/profiles/organisation/member/me/",
  },
  ORGANISATION_LOGO_UPLOAD_V2: {
    method: "POST",
    url: "/api/v2/profiles/organisation/me/logo",
  },
  ORGANISATION_INVITE: {
    method: "GET",
    url: "/api/v2/profiles/organisation/invite/",
  },
  ORGANISATION_INVITE_ACCEPT: {
    method: "POST",
    url: "/api/v2/profiles/organisation/invite/accept/",
  },
  ORGANISATION_INVITE_DECLINE: {
    method: "POST",
    url: "/api/v2/profiles/organisation/invite/decline/",
  },
  ORGANISATION_MEMBERS: {
    method: "GET",
    url: "/api/v2/profiles/organisation/members/",
  },
  ORGANISATION_INVITE_SEND: {
    method: "POST",
    url: "/api/v2/profiles/organisation/invite/",
  },
  ORGANISATION_INVITES: {
    method: "GET",
    url: "/api/v2/profiles/organisation/invites/",
  },
  ORGANISATION_INVITE_REVOKE: (id: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/profiles/organisation/invite/${id}/revoke/`,
  }),
  ORGANISATION_MEMBER_UPDATE: (id: string): ApiEndpoint => ({
    method: "PATCH",
    url: `/api/v2/profiles/organisation/member/${id}/`,
  }),
  ORGANISATION_MEMBER_REMOVE: (id: string): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v2/profiles/organisation/member/${id}/`,
  }),
  STUDENT_PROFILE_UPDATE_V2: {
    method: "PATCH",
    url: "/api/v2/profiles/student/me/",
  },
  RESUME_UPLOAD: {
    method: "POST",
    url: `/api/v2/profiles/student/me/resume/`,
  },
  USER_ME_V2: {
    method: "GET",
    url: "/api/v2/users/me/",
  },
  USER_ME_UPDATE_V2: {
    method: "PATCH",
    url: "/api/v2/users/me/",
  },
  TAXONOMY: {
    method: "GET",
    url: "/api/v2/taxonomy/",
  },
  LOGO_UPLOAD: (userType: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/${userType}/upload-logo`,
  }),
  LOGO_DELETE: (userType: string): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v1/${userType}/upload-logo`,
  }),

  STUDENT_CARD_V2: (studentId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/ui/student/${studentId}/card/`,
  }),
  ORGANISATION_CARD_V2: (organisationId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/ui/organisation/${organisationId}/card/`,
  }),
  OPPORTUNITY_DETAIL: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/opportunities/${opportunityId}/`,
  }),
  INVITE_ACCEPT: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/opportunities/${opportunityId}/accept/`,
  }),
  // folder endpoints using v2 opportunity-scoped APIs
  FOLDERS: (opportunitySlug: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v2/opportunities/folders/?opportunity=${opportunitySlug}`,
  }),
  CREATE_FOLDER: {
    method: "POST",
    url: "/api/v2/opportunities/folders/",
  },
  FOLDER_DETAIL: (folderId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v2/opportunities/folders/${folderId}/`,
  }),
  UPDATE_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "PUT",
    url: `/api/v2/opportunities/folders/${folderId}/`,
  }),
  DELETE_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v2/opportunities/folders/${folderId}/`,
  }),
  CHANGE_PASSWORD: {
    method: "POST",
    url: "/api/v1/change-password/",
  },
  ADD_MEMBER_TO_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/opportunities/folders/${folderId}/member/`,
  }),
  REMOVE_MEMBER_FROM_FOLDER: (folderId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/opportunities/folders/${folderId}/member/remove/`,
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
  SET_DEFAULT_OPPORTUNITY: (opportunityId: string | number): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/opportunities/${opportunityId}/set-default/`,
  }),
  CLEAR_DEFAULT_OPPORTUNITY: (opportunityId: string | number): ApiEndpoint => ({
    method: "DELETE",
    url: `/api/v2/opportunities/${opportunityId}/set-default/`,
  }),
  COORDINATOR_OPP_DASHBOARD: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v2/opportunities/coordinator/${opportunityId}/dashboard/`,
  }),
  HOMEPAGE: {
    method: "GET",
    url: "/api/v2/ui/homepage",
  },
  COORDINATOR_OPP_PARTICIPANTS: (opportunityId: string): ApiEndpoint => ({
    method: "GET",
    url: `/api/v2/opportunities/coordinator/${opportunityId}/participants/`,
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
    url: "/api/v2/generic/geocode/search/",
  },
  ABN_VALIDATE: {
    method: "POST",
    url: "/api/v2/generic/abn/validate/",
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
  SUBSCRIPTION_CANCEL: {
    method: "POST",
    url: "/api/v1/subscriptions/cancel/",
  },
  PRODUCT_PRICING: {
    method: "GET",
    url: "/api/v1/subscriptions/product-pricing/",
  },
  CHECKOUT_SESSION: {
    method: "POST",
    url: "/api/v1/subscriptions/checkout-session/",
  },
  // V2 Discovery endpoints
  OPPORTUNITY_FACETS: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/opportunities/${opportunityId}/participants/facets`,
  }),
  OPPORTUNITY_SEARCH: (opportunityId: string): ApiEndpoint => ({
    method: "POST",
    url: `/api/v2/opportunities/${opportunityId}/participants/search`,
  }),
  // Messaging
  LIST_CONVERSATIONS: (): ApiEndpoint => ({
    method: "GET",
    url: "/api/v1/messaging/conversations/",
  }),
  LIST_MESSAGES: (conversationId: number): ApiEndpoint => ({
    method: "GET",
    url: `/api/v1/messaging/conversations/${conversationId}/messages/`,
  }),
  GET_OR_CREATE_CONVERSATION: (): ApiEndpoint => ({
    method: "POST",
    url: "/api/v1/messaging/conversations/get-or-create/",
  }),
  SEND_MESSAGE: (conversationId: string | number): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/messaging/conversations/${conversationId}/messages/`,
  }),
  UPDATE_CONVERSATION_STATE: (conversationId: number): ApiEndpoint => ({
    method: "PATCH",
    url: `/api/v1/messaging/conversations/${conversationId}/state/`,
  }),
  MARK_CONVERSATION_READ: (conversationId: number): ApiEndpoint => ({
    method: "POST",
    url: `/api/v1/messaging/conversations/${conversationId}/read/`,
  }),
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
    method: method.toLowerCase() as "get" | "post" | "put" | "delete" | "patch",
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
