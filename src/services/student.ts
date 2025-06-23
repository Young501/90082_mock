import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";

export function useUserProfile(userType: string) {
  return useQuery({
    queryKey: ["user-profile", userType],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.USER_PROFILE(userType),
      }),
    enabled: !!userType,
    retry: (failureCount: number, error: any) => {
      if (error.message.includes("404")) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useOnboardingSubmission(userType: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (answers: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.ONBOARDING_SUBMISSION(userType),
        body: answers,
      });
    },
    onSuccess: (_response: any, _variables, _context) => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
  });
}

export function useProfilePictureUpload(userType: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.PROFILE_PICTURE_UPLOAD(userType),
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
  });
}

export function useResumeUpload(userType: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.RESUME_UPLOAD(userType),
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", userType] });
    },
  });
}
