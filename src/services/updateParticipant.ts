import { useMutation } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { useAuthStore } from "@/store";

// UC-310: Update participant record for a specific opportunity
export function useUpdateOpportunityParticipant() {
  return useMutation({
    mutationFn: async ({
      opportunityId,
      questionnaireAnswers
    }: {
      opportunityId: string | number;
      questionnaireAnswers: Record<string, any>
    }) => {
      const response = await apiRequest({
        endpoint: API_ENDPOINTS.UPDATE_OPPORTUNITY_PARTICIPANT(
          Number(opportunityId)
        ),
        body: {
          questionnaire_answers: questionnaireAnswers
        }
      });
      return response;
    }
  });
}

// UC-310: Re-enroll in an opportunity
export function useReEnrollOpportunity() {
  const { user } = useAuthStore();

  return useMutation({
    mutationFn: async ({
      opportunityId,
      questionnaireAnswers
    }: {
      opportunityId: string | number;
      questionnaireAnswers?: Record<string, any>
    }) => {
      const userType = user?.user_types?.[0] || "student";
      const response = await apiRequest({
        endpoint: API_ENDPOINTS.RE_ENROLL_OPPORTUNITY(Number(opportunityId)),
        body: {
          user_type: userType,
          ...(questionnaireAnswers && { questionnaire_answers: questionnaireAnswers })
        }
      });
      return response;
    }
  });
}

// UC-310: Cancel enrollment in an opportunity
export function useCancelOpportunityEnrollment() {
  return useMutation({
    mutationFn: async ({
      opportunityId
    }: {
      opportunityId: string | number;
    }) => {
      const response = await apiRequest({
        endpoint: API_ENDPOINTS.CANCEL_OPPORTUNITY_ENROLLMENT(Number(opportunityId))
      });
      return response;
    }
  });
}
