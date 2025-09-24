import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store";

// UC-310: Update participant record for a specific opportunity
export function useUpdateOpportunityParticipant() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      opportunityId,
      questionnaireAnswers
    }: {
      opportunityId: string | number;
      questionnaireAnswers: Record<string, any>
    }) => {
      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.UPDATE_OPPORTUNITY_PARTICIPANT(
            Number(opportunityId)
          ),
          body: {
            questionnaire_answers: questionnaireAnswers
          }
        });
        return response;
      } catch (error: any) {
        console.error("Failed to update participant record:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch participant data
      queryClient.invalidateQueries({
        queryKey: ["opportunity-participant", variables.opportunityId, user?.id]
      });

      // Also invalidate all opportunities to update enrollment status
      queryClient.invalidateQueries({
        queryKey: ["all-opportunities", user?.id]
      });

      // Optimistic update for immediate UI feedback
      queryClient.setQueryData(
        ["opportunity-participant", variables.opportunityId, user?.id],
        (oldData: any) => {
          if (oldData) {
            // Since we're now sending complete questionnaire_answers, 
            // we can directly use the sent data
            return {
              ...oldData,
              data: {
                ...oldData.data,
                questionnaire_answers: variables.questionnaireAnswers
              }
            };
          }
          return oldData;
        }
      );
    },
    onError: (error: any) => {
      console.error("Update participant record failed:", error);
    },
  });
}

// UC-310: Re-enroll in an opportunity
export function useReEnrollOpportunity() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      opportunityId,
      questionnaireAnswers
    }: {
      opportunityId: string | number;
      questionnaireAnswers?: Record<string, any>
    }) => {
      try {
        const userType = user?.user_types?.[0] || "student";
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.RE_ENROLL_OPPORTUNITY(Number(opportunityId)),
          body: {
            user_type: userType,
            ...(questionnaireAnswers && { questionnaire_answers: questionnaireAnswers })
          }
        });
        return response;
      } catch (error: any) {
        console.error("Failed to re-enroll in opportunity:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Optimistically update the all-opportunities cache
      queryClient.setQueryData(["all-opportunities", user?.id], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((opportunity: any) => {
          if (opportunity.id === variables.opportunityId) {
            return {
              ...opportunity,
              is_enrolled: true,
              participant_record: data // Use the response data as the new participant record
            };
          }
          return opportunity;
        });
      });

      // Optimistically update the accessible-opportunities cache as well
      queryClient.setQueryData(["accessible-opportunities", user?.id], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((opportunity: any) => {
          if (opportunity.id === variables.opportunityId) {
            return {
              ...opportunity,
              status: "Enrolled"
            };
          }
          return opportunity;
        });
      });

      // Invalidate and refetch all opportunities to update enrollment status
      queryClient.invalidateQueries({
        queryKey: ["all-opportunities", user?.id]
      });

      // Invalidate accessible opportunities as well
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id]
      });

      // Invalidate participant record for this opportunity
      queryClient.invalidateQueries({
        queryKey: ["opportunity-participant", variables.opportunityId, user?.id]
      });
    },
    onError: (error: any) => {
      console.error("Re-enroll opportunity failed:", error);
    },
  });
}

// UC-310: Cancel enrollment in an opportunity
export function useCancelOpportunityEnrollment() {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      opportunityId
    }: {
      opportunityId: string | number;
    }) => {
      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.CANCEL_OPPORTUNITY_ENROLLMENT(Number(opportunityId))
        });
        return response;
      } catch (error: any) {
        console.error("Failed to cancel opportunity enrollment:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Optimistically update the all-opportunities cache
      queryClient.setQueryData(["all-opportunities", user?.id], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((opportunity: any) => {
          if (opportunity.id === variables.opportunityId) {
            return {
              ...opportunity,
              is_enrolled: false,
              participant_record: null
            };
          }
          return opportunity;
        });
      });

      // Optimistically update the accessible-opportunities cache as well
      queryClient.setQueryData(["accessible-opportunities", user?.id], (oldData: any) => {
        if (!oldData) return oldData;

        return oldData.map((opportunity: any) => {
          if (opportunity.id === variables.opportunityId) {
            return {
              ...opportunity,
              status: "Not Enrolled"
            };
          }
          return opportunity;
        });
      });

      // Clear participant record cache completely for cancelled opportunities
      // This avoids the need for GET v2 participant call
      queryClient.removeQueries({
        queryKey: ["opportunity-participant", variables.opportunityId, user?.id]
      });

      // Invalidate accessible-opportunities to trigger re-fetch in MyOpportunities component
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id]
      });
    },
    onError: (error: any) => {
      console.error("Cancel opportunity enrollment failed:", error);
    },
  });
}
