import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store/authStore";
import {
  Opportunity,
  OpportunitiesResponse,
  CategorizedOpportunities,
  ParticipantRecord,
} from "@/types/opportunities";

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

// UC-314: All accessible opportunities for current user
export interface AccessibleOpportunity {
  id: number;
  title: string;
  status: "Enrolled" | "Not Enrolled" | string;
}

export function useAccessibleOpportunities() {
  const { user } = useAuthStore();
  return useQuery<AccessibleOpportunity[]>({
    queryKey: ["accessible-opportunities"],
    queryFn: async () => {
      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.ALL_OPPORTUNITIES,
        });
        console.log("🔍 V2 API Response:", response);
        console.log("🔍 Response type:", typeof response);
        console.log("🔍 Is array:", Array.isArray(response));

        let opportunities: any[] = [];

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

        console.log("🔍 Processing opportunities:", opportunities.length);

        // Map opportunities using enrollment_status from API response
        const opportunitiesWithStatus = opportunities.map((o: any) => {
          console.log("🔍 Processing opportunity:", o);
          console.log("🔍 Available fields in opportunity:", Object.keys(o));

          // Use enrollment_status from API response if available
          let enrollmentStatus = "Not Enrolled";
          if (o.enrollment_status) {
            // Map API enrollment_status to our expected format
            if (
              o.enrollment_status === "enrolled" ||
              o.enrollment_status === "Enrolled"
            ) {
              enrollmentStatus = "Enrolled";
            } else if (
              o.enrollment_status === "not_enrolled" ||
              o.enrollment_status === "Not Enrolled"
            ) {
              enrollmentStatus = "Not Enrolled";
            } else {
              // Handle other possible values
              enrollmentStatus = o.enrollment_status;
            }
          }

          const mappedOpp = {
            id: o.id,
            title: o.title || o.name,
            status: enrollmentStatus,
          };
          console.log("🔍 Mapped opportunity:", mappedOpp);
          return mappedOpp;
        });

        console.log(
          "🔍 Final mapped opportunities with status:",
          opportunitiesWithStatus
        );
        return opportunitiesWithStatus;
      } catch (error: any) {
        console.error("❌ V2 API failed:", error);
        throw error;
      }
    },
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
  return useQuery({
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



// Helper function to categorize opportunities
export function categorizeOpportunities(
  opportunities: Opportunity[]
): CategorizedOpportunities {
  const enrolled: Opportunity[] = [];
  const closed: Opportunity[] = [];

  opportunities.forEach((opportunity) => {
    console.log(
      "🔍 Categorizing opportunity:",
      opportunity.id,
      "is_enrolled:",
      opportunity.is_enrolled
    );

    // Check if user is enrolled based on the updated logic
    const isEnrolled =
      opportunity.is_enrolled === true ||
      opportunity.participant_record?.status === "active" ||
      opportunity.participant_record?.accepted === true;

    if (isEnrolled) {
      enrolled.push(opportunity);
      console.log("🔍 Added to enrolled:", opportunity.id);
    } else {
      closed.push(opportunity);
      console.log("🔍 Added to closed:", opportunity.id);
    }
  });

  console.log(
    "🔍 Final categorization - Enrolled:",
    enrolled.length,
    "Closed:",
    closed.length
  );
  return { enrolled, closed };
}

// UC-326: Get participant record for a specific opportunity
export function useOpportunityParticipant(opportunityId: string | number) {
  const { user } = useAuthStore();

  return useQuery<ParticipantRecord>({
    queryKey: ["opportunity-participant", opportunityId],
    queryFn: async () => {
      try {
        const response = await apiRequest<ParticipantRecord>({
          endpoint: API_ENDPOINTS.OPPORTUNITY_PARTICIPANT(
            opportunityId.toString()
          ),
        });
        return response;
      } catch (error: any) {
        console.error("Failed to fetch participant record:", error);
        throw error;
      }
    },
    enabled: !!user && !!opportunityId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        // Participant record not found - this is expected for non-enrolled opportunities
        return false;
      }
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// UC-XXX: Enroll in opportunity
export function useOpportunityEnrollment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      opportunityId,
      email,
      userType,
      questionnaireAnswers,
    }: {
      opportunityId: string;
      email: string;
      userType: string;
      questionnaireAnswers: Record<string, any>;
    }) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.OPPORTUNITY_ENROLL(opportunityId),
        body: {
          email,
          user_type: userType,
          questionnaire_answers: questionnaireAnswers,
        },
      });
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries after successful enrollment
      queryClient.invalidateQueries({
        queryKey: ["opportunity-participant", variables.opportunityId],
      });
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities"],
      });
      queryClient.invalidateQueries({
        queryKey: ["opportunity-detail", variables.opportunityId],
      });
    },
  });
}
