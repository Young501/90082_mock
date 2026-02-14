import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { getHomepage } from "@/services/dashboard";
import type { HomepageStats } from "@/types/homepage";

export const useHomepage = (enabled = true) => {
  const {
    data: homepageStats,
    isLoading,
    error,
    refetch,
  } = useQuery<HomepageStats>({
    queryKey: ["homepage"],
    queryFn: async () => {
      try {
        return await getHomepage();
      } catch (err: unknown) {
        console.error("Failed to fetch homepage:", err);
        toast.error("Failed to load dashboard");
        throw err;
      }
    },
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });

  return {
    homepageStats,
    isLoading,
    error,
    refetch,
  };
};
