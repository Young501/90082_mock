import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient, apiRequest, API_ENDPOINTS } from "@/api";
import { AbnValidationResponse, OrganisationInvite } from "@/types/shared";


export async function checkOrganisationInvite<T = OrganisationInvite>(): Promise<T | null> {
  const response = await apiClient.request({
    method: "get",
    url: API_ENDPOINTS.ORGANISATION_INVITE.url,
  });
  if (response.status === 204) return null;
  return response.data as T;
}

export function useOrganisationDomainCheck() {
  return useQuery({
    queryKey: ["organisation-domain-check"],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ORGANISATION_CHECK_DOMAIN }),
    enabled: false,
    retry: false,
  });
}

export function useOrganisationDetail(id: string) {
  return useQuery({
    queryKey: ["organisation-detail", id],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ORGANISATION_DETAIL(id) }),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
  });
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
      queryClient.invalidateQueries({ queryKey: ["organisation-member-me-v2"] });
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", "organisation"] });
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
      queryClient.invalidateQueries({ queryKey: ["user-profile", "organisation"] });
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
      queryClient.invalidateQueries({ queryKey: ["user-profile", "organisation"] });
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
      queryClient.invalidateQueries({ queryKey: ["user-profile", "organisation"] });
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
        endpoint: API_ENDPOINTS.PARTNER_PROFILE(id, opportunityId),
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
      queryClient.invalidateQueries({ queryKey: ["organisation-member-me-v2"] });
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
      // Invalidate member/profile so onboarding fetches fresh → 404 → full user + org flow
      queryClient.invalidateQueries({ queryKey: ["organisation-member-me-v2"] });
      queryClient.invalidateQueries({ queryKey: ["organisation-profile-v2"] });
    },
  });
}
