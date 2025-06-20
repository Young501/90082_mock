import { useQuery } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";

export function useUserTypes() {
  return useQuery({
    queryKey: ["user-types"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.USER_TYPES }),
    staleTime: 10 * 60 * 1000,
  });
}

export function useOnboardingPages(userType: string) {
  return useQuery({
    queryKey: ["onboarding-pages", userType],
    queryFn: () =>
      apiRequest({ endpoint: API_ENDPOINTS.ONBOARDING_PAGES(userType) }),
    enabled: !!userType,
    staleTime: 10 * 60 * 1000,
  });
}
