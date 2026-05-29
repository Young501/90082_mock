import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";

export function useStudentProfileV2(enabled: boolean = true) {
  return useQuery({
    queryKey: ["student-profile-v2"],
    queryFn: () => apiRequest({ endpoint: API_ENDPOINTS.STUDENT_PROFILE_V2 }),
    enabled,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

export function useStudentProfileUpdateV2() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Record<string, any>) => {
      return apiRequest({
        endpoint: API_ENDPOINTS.STUDENT_PROFILE_UPDATE_V2,
        body: data,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["student-profile-v2"] });
      queryClient.invalidateQueries({ queryKey: ["user-profile", "student"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useResumeUpload() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return apiRequest({
        endpoint: API_ENDPOINTS.RESUME_UPLOAD,
        body: formData,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", "student"] });
      queryClient.invalidateQueries({ queryKey: ["student-profile-v2"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useResumeDelete() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      return apiRequest({
        endpoint: API_ENDPOINTS.RESUME_DELETE,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user-profile", "student"] });
      queryClient.invalidateQueries({ queryKey: ["student-profile-v2"] });
      queryClient.invalidateQueries({ queryKey: ["homepage"] });
    },
  });
}

export function useStudentProfile(id: string, opportunityId: string) {
  return useQuery({
    queryKey: ["student-profile", id, opportunityId],
    queryFn: () =>
      apiRequest({
        endpoint: API_ENDPOINTS.STUDENT_CARD_V2(id),
        body: opportunityId ? { opportunity_id: opportunityId } : undefined,
      }),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    retry: (failureCount, error: any) => {
      if (error?.response?.status === 404) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
