import { API_ENDPOINTS, apiRequest } from "@/api";
import { useAuthStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";

export interface DashboardStats {
  students: {
    invited: number;
    accepted: number;
    messaged: number;
    matched: number;
  };
  partners: {
    invited: number;
    accepted: number;
    messaged: number;
    matched: number;
  };
}

export const useDashboard = (opportunityId?: string) => {
  const { getCoordinatorOpportunities } = useAuthStore();
  const coordinatorOpportunities = getCoordinatorOpportunities();
  
  const selectedOpportunityId = opportunityId || coordinatorOpportunities[0];

  const {
    data: dashboardStats,
    isLoading,
    error,
    refetch,
  } = useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", selectedOpportunityId],
    queryFn: async () => {
      if (!selectedOpportunityId) {
        throw new Error("No opportunity selected");
      }

      try {
        const response = await apiRequest({
          endpoint: API_ENDPOINTS.OPPORTUNITY_DASHBOARD(selectedOpportunityId),
        });
        
        return {
          students: {
            invited: response.students.invited || 0,
            accepted: response.students.accepted || 0,
            messaged: response.students.messaged || 0,
            matched: response.students.matched || 0,
          },
          partners: {
            invited: response.partners.invited || 0,
            accepted: response.partners.accepted || 0,
            messaged: response.partners.messaged || 0,
            matched: response.partners.matched || 0,
          },
        };
      } catch (error: any) {
        console.error("Failed to fetch dashboard stats:", error);
        toast.error("Failed to fetch dashboard statistics");
        throw error;
      }
    },
    enabled: !!selectedOpportunityId,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    dashboardStats,
    isLoading,
    error,
    refetch,
    coordinatorOpportunities,
    selectedOpportunityId,
  };
}; 