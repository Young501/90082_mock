import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store/authStore";

export function useOnboardingSubmission(userType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ONBOARDING_SUBMISSION(userType),
        body: answers,
      });
    },
    onSuccess: (_response: any, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
  });
}

export function useProfilePictureUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.PROFILE_PICTURE_UPLOAD,
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}

export function useResumeUpload(userType: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.RESUME_UPLOAD(userType),
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
  });
}

export function useProfileUpdate(userType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.PROFILE_UPDATE(userType),
        body: answers,
      });
    },
    onSuccess: (_response: any, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
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

export function useLogoUpload(userType: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.LOGO_UPLOAD(userType),
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
  });
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

export function useGeocode() {
  const { getUserType } = useAuthStore();
  const user_type = getUserType();
  let target = "user";
  if (user_type === "organisation") target = "organisation";
  return useMutation({
    mutationFn: async (address: string) => {
      const result = await apiRequest({
        endpoint: API_ENDPOINTS.GEOCODE,
        body: { address, target },
      });
      return result;
    },
  });
}

export function useUserProfile(userType: string) {
  return useQuery({
    queryKey: ["user-profile", userType],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.USER_PROFILE(userType) }),
    enabled: !!userType,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useStudentProfile(id: string, opportunityId: string) {
  return useQuery({
    queryKey: ["student-profile", id, opportunityId],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.STUDENT_PROFILE(id, opportunityId),
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

export function useAcceptedOpportunities() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["accepted-opportunities"],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ACCEPTED_OPPORTUNITIES }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useAllOpportunities() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["all-opportunities"],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ALL_OPPORTUNITIES }),
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 403 || error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useContactUser() {
  return useMutation({
    mutationFn: async (data: {
      opportunityId: string;
      user_id?: number;
      reply_to: string;
      subject?: string;
      message: string;
      organisation_id?: string;
    }) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.CONTACT_USER(data.opportunityId),
        body: {
          reply_to: data.reply_to,
          subject: data.subject || "",
          message: data.message,
          user_id: data.user_id,
          organisation_id: data.organisation_id,
        },
      });
    },
  });
}

export function useQuestionnaireFilters(
  opportunityId: string,
  userType: string
) {
  return useQuery({
    queryKey: ["questionnaire-filters", opportunityId, userType],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.QUESTIONNAIRE_FILTERS(opportunityId, userType),
      }),
    enabled: !!opportunityId && !!userType,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useInviteParticipants() {
  return useMutation({
    mutationFn: async (data: {
      opportunityId: string;
      invitations: Array<{
        email: string;
        role: "student" | "organisation";
      }>;
    }) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.INVITE_PARTICIPANTS(data.opportunityId),
        body: {
          invitations: data.invitations,
        },
      });
    },
  });
}

export function useCoordinatorViewUserProfile(participantId: string, opportunityId: string) {
  return useQuery({
    queryKey: ["coordinator-view-user-profile", participantId, opportunityId],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.COORDINATOR_VIEW_USER_PROFILE(participantId, opportunityId) }),
    enabled: !!participantId && !!opportunityId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });

}
