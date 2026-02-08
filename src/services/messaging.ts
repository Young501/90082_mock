import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import { ConversationResponse } from "@/types/messaging";

  
  export function useGetOrCreateConversation() {
    return useMutation({
      mutationFn: async (data: {
        other_user_id: number;
        opportunity_id?: number;
      }) => {
        return apiRequest<ConversationResponse>({
          endpoint: API_ENDPOINTS.GET_OR_CREATE_CONVERSATION(),
          body: {
            other_user_id: data.other_user_id,
            ...(data.opportunity_id != null && { opportunity_id: data.opportunity_id }),
          },
        });
      },
    });
  }
  
  export function useSendMessage() {
    return useMutation({    
      mutationFn: async (data: {
        conversationId: number;
        content: string;
        files?: File[];
      }) => {
        if (!data.files?.length) {
          return apiRequest({
            endpoint: API_ENDPOINTS.SEND_MESSAGE(data.conversationId),
            body: { content: data.content },
          });
        }
        const formData = new FormData();
        formData.append("content", data.content);
        data.files.forEach((file) => formData.append("files[]", file));
        return apiRequest({
          endpoint: API_ENDPOINTS.SEND_MESSAGE(data.conversationId),
          body: formData,
        });
      },
    });
  }
  