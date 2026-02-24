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
      questionnaireAnswers,
      accepted,
    }: {
      opportunityId: string | number;
      questionnaireAnswers?: Record<string, any>;
      accepted?: boolean;
    }) => {
      const body: Record<string, any> = {};

      if (questionnaireAnswers !== undefined) {
        body.questionnaire_answers = questionnaireAnswers;
      }
      if (accepted !== undefined) {
        body.accepted = accepted;
      }

      const response = await apiRequest({
        endpoint: API_ENDPOINTS.UPDATE_OPPORTUNITY_PARTICIPANT(
          Number(opportunityId)
        ),
        body,
      });

      return response;
    },
    onSuccess: (response, variables) => {
      const { opportunityId, questionnaireAnswers, accepted } = variables;

      if (questionnaireAnswers !== undefined) {
        queryClient.setQueryData(
          ["opportunity-participant", opportunityId],
          response
        );
      }

      if (accepted === false) {
        queryClient.removeQueries({
          queryKey: ["opportunity-participant", opportunityId],
        });
        queryClient.setQueryData(
          ["opportunity-participant", opportunityId],
          null
        );
        queryClient.invalidateQueries({
          queryKey: ["accessible-opportunities", user?.id],
        });
        queryClient.invalidateQueries({
          queryKey: ["all-opportunities", user?.id],
        });
      }

      queryClient.invalidateQueries({ queryKey: ["opportunity-participant"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

// UC-310: Enroll in an opportunity (renamed from useReEnrollOpportunity)
export function useEnrollInOpportunity() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      opportunityId,
      questionnaireAnswers,
    }: {
      opportunityId: string | number;
      questionnaireAnswers?: Record<string, any>;
    }) => {
      const userType = user?.user_types?.[0] || "student";
      const response = await apiRequest({
        endpoint: API_ENDPOINTS.OPPORTUNITY_ENROLLMENT(
          opportunityId.toString()
        ),
        body: {
          user_type: userType,
          ...(questionnaireAnswers && {
            questionnaire_answers: questionnaireAnswers,
          }),
        },
      });
      return response;
    },
    onSuccess: () => {
      // Invalidate accessible opportunities query to refresh MyOpportunities
      queryClient.invalidateQueries({
        queryKey: ["accessible-opportunities", user?.id],
      });
      // Also invalidate opportunity participant query
      queryClient.invalidateQueries({ queryKey: ["opportunity-participant"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

// UC-310: Cancel enrollment in an opportunity
export function useCancelOpportunityEnrollment() {
  return useMutation({
    mutationFn: async ({
      opportunityId,
    }: {
      opportunityId: string | number;
    }) => {
      const response = await apiRequest({
        endpoint: API_ENDPOINTS.CANCEL_OPPORTUNITY_ENROLLMENT(
          Number(opportunityId)
        ),
      });
      return response;
    },
  });
}
