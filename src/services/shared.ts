import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Opportunity, AccessibleOpportunity } from "@/types/opportunities";
import { TaxonomyQueryParams } from "@/types/shared";

// Re-export student-specific services
export {
  useStudentProfileV2,
  useStudentProfileUpdateV2,
  useResumeUpload,
  useStudentProfile,
} from "./student";

// Re-export organisation-specific services
export {
  useOrganisationDomainCheck,
  useOrganisationDetail,
  useOrganisationMemberMeV2,
  useOrganisationProfileV2,
  useOrganisationMemberUpdateV2,
  useOrganisationProfileCreateV2,
  useOrganisationProfileUpdateV2,
  useOrganisationLogoUploadV2,
  useAbnValidation,
  usePartnerProfile,
} from "./organisation";

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
      queryClient.invalidateQueries({ queryKey: ["user-me-v2"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useProfilePictureDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.PROFILE_PICTURE_DELETE,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["user-me-v2"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
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
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useOnboardingPages(userType: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ["onboarding-pages", userType],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ONBOARDING_PAGES(userType) }),
    enabled: !!userType && enabled,
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
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
      if (userType === "organisation") {
        queryClient.invalidateQueries({
          queryKey: ["organisation-profile-v2"],
        });
      }
    },
  });
}

export function useLogoDelete(userType: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.LOGO_DELETE(userType),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useGeocode() {
  return useMutation({
    mutationFn: async (address: string) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.GEOCODE,
        body: { address },
      });
    },
  });
}

export function useUserMeV2(enabled: boolean = true) {
  return useQuery({
    queryKey: ["user-me-v2"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.USER_ME_V2 }),
    enabled,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTaxonomy(params: TaxonomyQueryParams | null) {
  const queryParams: Record<string, string> = {};
  if (params) {
    queryParams.type = params.type;
    if (
      params.university != null &&
      params.university !== "" &&
      params.university !== "dynamic"
    ) {
      queryParams.university = params.university;
    }
    if (params.parent != null && params.parent !== "") {
      queryParams.parent = params.parent;
    }
  }

  return useQuery({
    queryKey: ["taxonomy", params],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.TAXONOMY,
        params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
      }),
    enabled: !!params?.type,
    staleTime: 10 * 60 * 1000,
  });
}

export function useUserMeUpdateV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.USER_ME_UPDATE_V2,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-me-v2"] });
      queryClient.invalidateQueries({ queryKey: ["user"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

// UC-314: All accessible opportunities for current user
export function useAccessibleOpportunities(enabled = true) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["accessible-opportunities", user?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.ALL_OPPORTUNITIES,
        });

        let opportunities: AccessibleOpportunity[] = [];

        if (Array.isArray(response)) {
          opportunities = response;
        } else if (
          response.opportunities &&
          Array.isArray(response.opportunities)
        ) {
          opportunities = response.opportunities;
        } else {
          console.warn("⚠️ Unexpected V2 API response structure:", response);
          return [];
        }

        const opportunitiesWithStatus = opportunities.map(
          (o: AccessibleOpportunity) => {
            let enrollmentStatus = "not_enrolled";
            if (o.enrollment_status) {
              if (o.enrollment_status === "enrolled") {
                enrollmentStatus = "enrolled";
              } else if (o.enrollment_status === "not_enrolled") {
                enrollmentStatus = "not_enrolled";
              } else {
                enrollmentStatus = o.enrollment_status;
              }
            }

            return {
              id: o.id,
              public_id: o.public_id || "",
              title: o.title,
              logo_url: o.logo_url,
              enrollment_status: enrollmentStatus,
              description: o.description || "",
              start_date: o.start_date || "",
              end_date: o.end_date || "",
              created_by: o.created_by || 0,
              is_active: o.is_active !== undefined ? o.is_active : true,
              created_at: o.created_at || "",
              updated_at: o.updated_at || "",
              questionnaire: o.questionnaire || {},
              is_enrolled: enrollmentStatus === "enrolled",
              visibility_display: o.visibility_display || "",
              access: o.access || null,
              slug: o.slug || "",
              is_default: o.is_default ?? false,
              is_hidden: o.is_hidden ?? false,
              links: o.links,
              enrollment_preview: o.enrollment_preview ?? null,
              coordinator: o.coordinator ?? null,
            };
          }
        );

        return opportunitiesWithStatus;
      } catch (error: any) {
        console.error("❌ V2 API failed:", error);
        throw error;
      }
    },
    enabled: enabled && !!user,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useCoordinatorOpportunities(enabled = true) {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["coordinator-opportunities", user?.id],
    enabled: enabled && !!user,
    queryFn: async () => {
      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.COORDINATOR_OPPORTUNITIES,
        });
        return Array.isArray(response) ? (response as AccessibleOpportunity[]) : [];
      } catch (error: any) {
        console.error("❌ Coordinator opportunities fetch failed:", error);
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) return false;
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

export function useInvitePreview(
  opportunityId: string,
  userType: "student" | "organisation",
  isResend: boolean = false
) {
  return useQuery<{ subject: string; body: string; rendered_html: string; message: string }>({
    queryKey: ["invite-preview", opportunityId, userType, isResend],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.INVITE_PREVIEW(opportunityId, userType), body: { is_resend: isResend } }),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useInvitePreviewRefresh() {
  return useMutation({
    mutationFn: async (data: {
      opportunityId: string;
      userType: "student" | "organisation";
      subject: string;
      body: string;
      isResend?: boolean;
    }) => {
      return apiRequest<{ subject: string; body: string; rendered_html: string; message: string }>({
        endpoint: API_ENDPOINTS.INVITE_PREVIEW(data.opportunityId, data.userType),
        body: { subject: data.subject, body: data.body, is_resend: data.isResend ?? false },
      });
    },
  });
}

export function useInviteV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: {
      opportunityId: string;
      userType: "student" | "organisation";
      emails: string[];
      customEmail?: { subject: string; body: string };
    }) => {
      const body: Record<string, unknown> = { emails: data.emails };
      if (data.customEmail) body.custom_email = data.customEmail;
      return apiRequest({
        endpoint: API_ENDPOINTS.INVITE_V2(data.opportunityId, data.userType),
        body,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["participants"] });
    },
  });
}

export function useOpportunityDetail(opportunityId: string) {
  return useQuery<Opportunity>({
    queryKey: ["opportunity-detail", opportunityId],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.OPPORTUNITY_DETAIL(opportunityId) }),
    enabled: !!opportunityId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useOpportunityParticipant(
  opportunityId: string | number,
  enabled?: boolean
) {
  return useQuery({
    queryKey: ["opportunity-participant", opportunityId],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.OPPORTUNITY_PARTICIPANT(Number(opportunityId)),
      }),
    enabled:
      enabled !== undefined ? enabled && !!opportunityId : !!opportunityId,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function categorizeOpportunities(
  opportunities: (Opportunity | AccessibleOpportunity)[]
) {
  const enrolled: (Opportunity | AccessibleOpportunity)[] = [];
  const closed: (Opportunity | AccessibleOpportunity)[] = [];

  opportunities.forEach((opportunity) => {
    let isEnrolled = false;

    if ("enrollment_status" in opportunity) {
      isEnrolled = opportunity.enrollment_status === "enrolled";
    } else if (
      "participant_record" in opportunity &&
      opportunity.participant_record
    ) {
      isEnrolled = opportunity.participant_record.status === "Enrolled";
    } else if (opportunity.is_enrolled === true) {
      isEnrolled = true;
    }

    if (isEnrolled) {
      enrolled.push(opportunity);
    } else {
      closed.push(opportunity);
    }
  });

  return { enrolled, closed };
}
