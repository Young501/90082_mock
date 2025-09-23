import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store/authStore";
import { Opportunity, OpportunitiesResponse, OpportunitiesMap, CategorizedOpportunities, ParticipantRecord } from "@/types/opportunities";

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

<<<<<<< HEAD
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
        const response = await apiRequest({ endpoint: API_ENDPOINTS.OPPORTUNITIES_ALL_V2 });
        console.log("🔍 V2 API Response:", response);
        console.log("🔍 Response type:", typeof response);
        console.log("🔍 Is array:", Array.isArray(response));
        
        let opportunities: any[] = [];
        
        // Handle different response structures
        if (Array.isArray(response)) {
          opportunities = response;
        } else if (response.opportunities && Array.isArray(response.opportunities)) {
          opportunities = response.opportunities;
        } else {
          console.warn("⚠️ Unexpected V2 API response structure:", response);
          return [];
        }
        
        console.log("🔍 Processing opportunities:", opportunities.length);
        
        // For each opportunity, check enrollment status
        const opportunitiesWithStatus = await Promise.all(
          opportunities.map(async (o: any) => {
            console.log("🔍 Processing opportunity:", o);
            console.log("🔍 Available fields in opportunity:", Object.keys(o));
            
            let enrollmentStatus = "Not Enrolled";
            
            try {
              // Try to get participant record for this opportunity
              const participantResponse = await apiRequest({ 
                endpoint: API_ENDPOINTS.OPPORTUNITY_PARTICIPANT(o.id.toString())
              });
              console.log("🔍 Participant response for opportunity", o.id, ":", participantResponse);
              console.log("🔍 Participant response fields:", Object.keys(participantResponse));
              
              // Check different possible enrollment indicators
              if (participantResponse) {
                if (participantResponse.status === "active") {
                  enrollmentStatus = "Enrolled";
                } else if (participantResponse.accepted === true) {
                  enrollmentStatus = "Enrolled";
                } else if (participantResponse.id) {
                  // If we have a participant record with an ID, consider it enrolled
                  enrollmentStatus = "Enrolled";
                }
              }
            } catch (participantError: any) {
              console.log("🔍 No participant record for opportunity", o.id, ":", participantError?.response?.status);
              // 404 means no participant record, which means not enrolled
              // Other errors also default to not enrolled
            }
            
            const mappedOpp = {
              id: o.id,
              title: o.title || o.name,
              status: enrollmentStatus,
            };
            console.log("🔍 Mapped opportunity:", mappedOpp);
            return mappedOpp;
          })
        );
        
        console.log("🔍 Final mapped opportunities with status:", opportunitiesWithStatus);
        return opportunitiesWithStatus;
        
      } catch (e: any) {
        console.log("❌ V2 API failed, falling back to V1:", e);
        // Fallback to v1 accepted if v2 not available
        const v1 = await apiRequest<any[]>({
          endpoint: API_ENDPOINTS.ACCEPTED_OPPORTUNITIES,
        });
        console.log("🔍 V1 fallback response:", v1);
        return (v1 || []).map((o: any) => ({
          id: o.id,
          title: o.title || o.name,
          status: "Enrolled",
        }));
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
=======
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
>>>>>>> develop
        return false;
      }
      return failureCount < 2;
    },
  });
}
<<<<<<< HEAD
=======

>>>>>>> develop
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

// UC-326: My Opportunities - Fetch all opportunities with enrollment status
export function useAllOpportunities() {
  const { user } = useAuthStore();
  
  return useQuery<Opportunity[]>({
    queryKey: ["all-opportunities"],
    queryFn: async () => {
      try {
        const response = await apiRequest({ endpoint: API_ENDPOINTS.OPPORTUNITIES_ALL_V2 });
        console.log("🔍 MyOpportunities - V2 API Response:", response);
        
        let opportunities: any[] = [];
        
        // Handle different response structures
        if (Array.isArray(response)) {
          opportunities = response;
        } else if (response.opportunities && Array.isArray(response.opportunities)) {
          opportunities = response.opportunities;
        } else {
          console.warn("⚠️ MyOpportunities - Unexpected V2 API response structure:", response);
          return [];
        }
        
        console.log("🔍 MyOpportunities - Processing opportunities:", opportunities.length);
        
        // For each opportunity, check enrollment status and get participant record
        const opportunitiesWithStatus = await Promise.all(
          opportunities.map(async (o: any) => {
            console.log("🔍 MyOpportunities - Processing opportunity:", o);
            
            let enrollmentStatus = "Not Enrolled";
            let participantRecord = null;
            
            try {
              // Try to get participant record for this opportunity
              const participantResponse = await apiRequest({ 
                endpoint: API_ENDPOINTS.OPPORTUNITY_PARTICIPANT(o.id.toString())
              });
              console.log("🔍 MyOpportunities - Participant response for opportunity", o.id, ":", participantResponse);
              
              // Check different possible enrollment indicators
              if (participantResponse) {
                participantRecord = participantResponse;
                if (participantResponse.status === "active") {
                  enrollmentStatus = "Enrolled";
                } else if (participantResponse.accepted === true) {
                  enrollmentStatus = "Enrolled";
                } else if (participantResponse.id) {
                  // If we have a participant record with an ID, consider it enrolled
                  enrollmentStatus = "Enrolled";
                }
              }
            } catch (participantError: any) {
              console.log("🔍 MyOpportunities - No participant record for opportunity", o.id, ":", participantError?.response?.status);
              // 404 means no participant record, which means not enrolled
            }
            
            const mappedOpp = {
              id: o.id,
              title: o.title || o.name,
              description: o.description,
              start_date: o.start_date,
              end_date: o.end_date,
              created_by: o.created_by,
              is_active: o.is_active,
              created_at: o.created_at,
              updated_at: o.updated_at,
              questionnaire: o.questionnaire,
              is_enrolled: enrollmentStatus === "Enrolled",
              participant_record: participantRecord,
            };
            console.log("🔍 MyOpportunities - Mapped opportunity:", mappedOpp);
            return mappedOpp;
          })
        );
        
        console.log("🔍 MyOpportunities - Final mapped opportunities:", opportunitiesWithStatus);
        return opportunitiesWithStatus;
        
      } catch (error: any) {
        console.error("Failed to fetch all opportunities:", error);
        throw error;
      }
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 401 || error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Helper function to create normalized map of opportunities
export function createOpportunitiesMap(opportunities: Opportunity[]): OpportunitiesMap {
  return opportunities.reduce((map, opportunity) => {
    map[opportunity.id] = opportunity;
    return map;
  }, {} as OpportunitiesMap);
}

// Helper function to categorize opportunities
export function categorizeOpportunities(opportunities: Opportunity[]): CategorizedOpportunities {
  const enrolled: Opportunity[] = [];
  const closed: Opportunity[] = [];
  
  opportunities.forEach(opportunity => {
    console.log("🔍 Categorizing opportunity:", opportunity.id, "is_enrolled:", opportunity.is_enrolled);
    
    // Check if user is enrolled based on the updated logic
    const isEnrolled = opportunity.is_enrolled === true || 
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
  
  console.log("🔍 Final categorization - Enrolled:", enrolled.length, "Closed:", closed.length);
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
          endpoint: API_ENDPOINTS.OPPORTUNITY_PARTICIPANT(opportunityId.toString())
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
