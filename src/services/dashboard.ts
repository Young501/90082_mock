import { API_ENDPOINTS, apiRequest } from "@/api";

export const getDashboardStats = async (opportunityId: string) => {
  return apiRequest({
    endpoint: API_ENDPOINTS.OPPORTUNITY_DASHBOARD(opportunityId),
  });
}; 