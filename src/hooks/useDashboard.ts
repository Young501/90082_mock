import { useAuthStore } from "@/store";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getDashboardStats } from "@/services/dashboard";
import { DashboardStats } from "@/types/dashboard";

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
    queryFn: async (): Promise<DashboardStats> => {
      if (!selectedOpportunityId) {
        throw new Error("No opportunity selected");
      }

      try {
        const response = await getDashboardStats(selectedOpportunityId);

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
