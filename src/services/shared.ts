import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Opportunity, AccessibleOpportunity } from "@/types/opportunities";
import { AbnValidationResponse, TaxonomyQueryParams } from "@/types/shared";


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
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
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

export function useOnboardingPages(
  userType: string,
  enabled: boolean = true
) {
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

export function useStudentProfileV2(enabled: boolean = true) {
  return useQuery({
    queryKey: ["student-profile-v2"],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.STUDENT_PROFILE_V2 }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useUserMeV2() {
  return useQuery({
    queryKey: ["user-me-v2"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.USER_ME_V2 }),
    enabled: true,
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

export function useStudentProfileUpdateV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.STUDENT_PROFILE_UPDATE_V2,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile-v2"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", "student"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
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

// UC-314: All accessible opportunities for current user

export function useAccessibleOpportunities() {
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ["accessible-opportunities", user?.id],
    queryFn: async () => {
      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.ALL_OPPORTUNITIES,
        });

        let opportunities: AccessibleOpportunity[] = [];

        // Handle different response structures
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

        // Map opportunities using enrollment_status from API response
        const opportunitiesWithStatus = opportunities.map(
          (o: AccessibleOpportunity) => {
            // Use enrollment_status from API response if available
            let enrollmentStatus = "not_enrolled";
            if (o.enrollment_status) {
              // Map API enrollment_status to our expected format
              if (o.enrollment_status === "enrolled") {
                enrollmentStatus = "enrolled";
              } else if (o.enrollment_status === "not_enrolled") {
                enrollmentStatus = "not_enrolled";
              } else {
                // Handle other possible values
                enrollmentStatus = o.enrollment_status;
              }
            }

            const mappedOpp = {
              id: o.id,
              title: o.title,
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
            };
            return mappedOpp;
          }
        );

        return opportunitiesWithStatus;
      } catch (error: any) {
        console.error("❌ V2 API failed:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 2 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
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

export function useCoordinatorViewUserProfile(
  participantId: string,
  opportunityId: string
) {
  return useQuery({
    queryKey: ["coordinator-view-user-profile", participantId, opportunityId],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.COORDINATOR_VIEW_USER_PROFILE(
          participantId,
          opportunityId
        ),
      }),
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

// Get participant record for a specific opportunity
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
  });
}

// Utility function to categorize opportunities
export function categorizeOpportunities(
  opportunities: (Opportunity | AccessibleOpportunity)[]
) {
  const enrolled: (Opportunity | AccessibleOpportunity)[] = [];
  const closed: (Opportunity | AccessibleOpportunity)[] = [];

  opportunities.forEach((opportunity) => {
    let isEnrolled = false;

    // Check if it's an AccessibleOpportunity with status field
    if ("enrollment_status" in opportunity) {
      isEnrolled = opportunity.enrollment_status === "enrolled";
    }
    // Check if it's an Opportunity with participant_record
    else if (
      "participant_record" in opportunity &&
      opportunity.participant_record
    ) {
      isEnrolled = opportunity.participant_record.status === "Enrolled";
    }
    // Fallback to is_enrolled field
    else if (opportunity.is_enrolled === true) {
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
