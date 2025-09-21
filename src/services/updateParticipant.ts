import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";

// UC-310: Update participant record for a specific opportunity
export function useUpdateOpportunityParticipant() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      participantId, 
      questionnaireAnswers 
    }: { 
      opportunityId: string | number; 
      participantId: string | number; 
      questionnaireAnswers: Record<string, any> 
    }) => {
      try {
        const response = await apiRequest({ 
          endpoint: API_ENDPOINTS.UPDATE_OPPORTUNITY_PARTICIPANT(
            opportunityId.toString(), 
            participantId.toString()
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
        queryKey: ["opportunity-participant", variables.opportunityId] 
      });
      
      // Also invalidate all opportunities to update enrollment status
      queryClient.invalidateQueries({ 
        queryKey: ["all-opportunities"] 
      });
      
      // Optimistic update for immediate UI feedback
      queryClient.setQueryData(
        ["opportunity-participant", variables.opportunityId],
        (oldData: any) => {
          if (oldData) {
            return {
              ...oldData,
              questionnaire_answers: {
                ...oldData.questionnaire_answers,
                ...variables.questionnaireAnswers
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

// UC-326: Re-enroll in an opportunity
export function useReEnrollOpportunity() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      opportunityId, 
      questionnaireAnswers 
    }: { 
      opportunityId: string | number; 
      questionnaireAnswers?: Record<string, any> 
    }) => {
      try {
        const response = await apiRequest({ 
          endpoint: API_ENDPOINTS.RE_ENROLL_OPPORTUNITY(opportunityId.toString()),
          body: questionnaireAnswers ? {
            questionnaire_answers: questionnaireAnswers
          } : {}
        });
        return response;
      } catch (error: any) {
        console.error("Failed to re-enroll in opportunity:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Optimistically update the all-opportunities cache
      queryClient.setQueryData(["all-opportunities"], (oldData: any) => {
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
      queryClient.setQueryData(["accessible-opportunities"], (oldData: any) => {
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
        queryKey: ["all-opportunities"] 
      });
      
      // Invalidate accessible opportunities as well
      queryClient.invalidateQueries({ 
        queryKey: ["accessible-opportunities"] 
      });
      
      // Invalidate participant record for this opportunity
      queryClient.invalidateQueries({ 
        queryKey: ["opportunity-participant", variables.opportunityId] 
      });
    },
    onError: (error: any) => {
      console.error("Re-enroll opportunity failed:", error);
    },
  });
}

// UC-326: Cancel enrollment in an opportunity
export function useCancelOpportunityEnrollment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      opportunityId 
    }: { 
      opportunityId: string | number; 
    }) => {
      try {
        const response = await apiRequest({ 
          endpoint: API_ENDPOINTS.CANCEL_OPPORTUNITY_ENROLLMENT(opportunityId.toString())
        });
        return response;
      } catch (error: any) {
        console.error("Failed to cancel opportunity enrollment:", error);
        throw error;
      }
    },
    onSuccess: (data, variables) => {
      // Optimistically update the all-opportunities cache
      queryClient.setQueryData(["all-opportunities"], (oldData: any) => {
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
      
      // Invalidate and refetch all opportunities to ensure data consistency
      queryClient.invalidateQueries({ 
        queryKey: ["all-opportunities"] 
      });
      
      // Optimistically update the accessible-opportunities cache as well
      queryClient.setQueryData(["accessible-opportunities"], (oldData: any) => {
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
      
      // Invalidate accessible opportunities as well
      queryClient.invalidateQueries({ 
        queryKey: ["accessible-opportunities"] 
      });
      
      // Invalidate participant record for this opportunity
      queryClient.invalidateQueries({ 
        queryKey: ["opportunity-participant", variables.opportunityId] 
      });
    },
    onError: (error: any) => {
      console.error("Cancel opportunity enrollment failed:", error);
    },
  });
}
