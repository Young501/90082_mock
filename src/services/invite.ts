import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  Opportunity,
  InviteAcceptRequest,
  InviteAcceptResponse,
} from "@/types/invite";

export const getOpportunityDetail = async (
  opportunityId: string
): Promise<Opportunity> => {
  return apiRequest<Opportunity>({
    endpoint: API_ENDPOINTS.OPPORTUNITY_DETAIL(opportunityId),
  });
};

export const acceptInvite = async (
  opportunityId: string,
  token: string,
  questionnaire_answers?: Record<string, any>
): Promise<InviteAcceptResponse> => {
  const body: InviteAcceptRequest = { token };
  if (questionnaire_answers) {
    body.questionnaire_answers = questionnaire_answers;
  }

  return apiRequest<InviteAcceptResponse>({
    endpoint: API_ENDPOINTS.INVITE_ACCEPT(opportunityId),
    body,
  });
};
