import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiRequest, API_ENDPOINTS } from "@/api";
import {
  AbnValidationResponse,
  OrganisationInvite,
  OrganisationMember,
  OrganisationSentInvite,
} from "@/types/shared";

export async function checkOrganisationInvite<
  T = OrganisationInvite,
>(): Promise<T | null> {
  const response = await apiClient.request({
    method: "get",
    url: API_ENDPOINTS.ORGANISATION_INVITE.url,
  });
  if (response.status === 204) return null;
  return response.data as T;
}

export function useOrganisationMemberMeV2(enabled: boolean = true) {
  return useQuery({
    queryKey: ["organisation-member-me-v2"],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ORGANISATION_MEMBER_ME_V2 }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useOrganisationProfileV2(enabled: boolean = true) {
  return useQuery({
    queryKey: ["organisation-profile-v2"],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ORGANISATION_PROFILE_V2 }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
      return failureCount < 2;
    },
  });
}

export function useOrganisationMemberUpdateV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_MEMBER_ME_UPDATE_V2,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["organisation-member-me-v2"],
      });
      // queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", "organisation"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationProfileCreateV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_PROFILE_CREATE_V2,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
      // queryClient.invalidateQueries({
      //   queryKey: ["organisation-member-me-v2"],
      // });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", "organisation"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationProfileUpdateV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_PROFILE_UPDATE_V2,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", "organisation"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationLogoUploadV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_LOGO_UPLOAD_V2,
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", "organisation"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationLogoDeleteV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_LOGO_DELETE_V2,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
      queryClient.invalidateQueries({
        queryKey: ["user-profile", "organisation"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useAbnValidation() {
  return useMutation({
    mutationFn: async (payload: { abn: string; organisationName: string }) => {
      return apiRequest<AbnValidationResponse>({
        endpoint: API_ENDPOINTS.ABN_VALIDATE,
        body: payload,
      });
    },
  });
}

export function usePartnerProfile(id: string, opportunityId: string) {
  return useQuery({
    queryKey: ["partner-profile", id, opportunityId],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_CARD_V2(id),
        body: opportunityId ? { opportunity_id: opportunityId } : undefined,
      }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useOrganisationInvite(enabled: boolean = true) {
  return useQuery({
    queryKey: ["organisation-invite"],
    queryFn: () => checkOrganisationInvite<OrganisationInvite>(),
    enabled,
    retry: false,
    staleTime: 0,
  });
}

export function useOrganisationInviteAccept() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_INVITE_ACCEPT,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-invite"] });
      queryClient.invalidateQueries({
        queryKey: ["organisation-member-me-v2"],
      });
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
    },
  });
}

export function useOrganisationInviteDecline() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_INVITE_DECLINE,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-invite"] });
      queryClient.invalidateQueries({
        queryKey: ["organisation-member-me-v2"],
      });
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
    },
  });
}

export interface OrganisationMembersResponse {
  results?: OrganisationMember[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export interface OrganisationInvitesResponse {
  results?: OrganisationSentInvite[];
  count?: number;
  next?: string | null;
  previous?: string | null;
}

export function useOrganisationMembers(enabled = true) {
  return useQuery({
    queryKey: ["organisation-members"],
    queryFn: () =>
      apiRequest<OrganisationMembersResponse>({
        endpoint: API_ENDPOINTS.ORGANISATION_MEMBERS,
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useOrganisationInvites(
  status?: "pending" | "accepted" | "declined" | "revoked" | "expired",
  enabled = true
) {
  return useQuery({
    queryKey: ["organisation-invites", status],
    queryFn: () =>
      apiRequest<OrganisationInvitesResponse>({
        endpoint: API_ENDPOINTS.ORGANISATION_INVITES,
        params: status ? { status } : undefined,
      }),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useOrganisationInviteSend() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      platform_role: "member" | "admin";
    }) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_INVITE_SEND,
        body: payload,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-members"] });
      queryClient.invalidateQueries({ queryKey: ["organisation-invites"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationInviteRevoke() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (inviteId: string) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_INVITE_REVOKE(inviteId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-members"] });
      queryClient.invalidateQueries({ queryKey: ["organisation-invites"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationMemberUpdate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      memberId,
      platform_role,
      job_title,
    }: {
      memberId: string;
      platform_role?: "member" | "admin";
      job_title?: string;
    }) => {
      const body: Record<string, string> = {};
      if (platform_role) body.platform_role = platform_role;
      if (job_title !== undefined) body.job_title = job_title;
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_MEMBER_UPDATE(memberId),
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-members"] });
      queryClient.invalidateQueries({
        queryKey: ["organisation-member-me-v2"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOrganisationMemberRemove() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (memberId: string) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ORGANISATION_MEMBER_REMOVE(memberId),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisation-members"] });
      queryClient.invalidateQueries({
        queryKey: ["organisation-member-me-v2"],
      });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}
