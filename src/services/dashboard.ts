import { API_ENDPOINTS, apiRequest } from "@/api";
import type { HomepageStats } from "@/types/homepage";

export const getDashboardStats = async (opportunityId: string) => {
  return apiRequest({
    endpoint: API_ENDPOINTS.OPPORTUNITY_DASHBOARD(opportunityId),
  });
};

export const getHomepage = async (): Promise<HomepageStats> => {
  return apiRequest({
    endpoint: API_ENDPOINTS.HOMEPAGE,
  });
};
