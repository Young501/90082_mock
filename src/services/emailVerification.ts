import { useMutation } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { EmailVerificationData, EmailVerificationResponse } from "@/types/auth";

export function useEmailVerification() {
  return useMutation<EmailVerificationResponse, unknown, EmailVerificationData>(
    {
      mutationFn: async (data) => {
        const endpoint = {
          ...API_ENDPOINTS.EMAIL_VERIFICATION,
          url: `${
            API_ENDPOINTS.EMAIL_VERIFICATION.url
          }?token=${encodeURIComponent(data.token)}`,
        };
        return apiRequest({ endpoint });
      },
    }
  );
}
