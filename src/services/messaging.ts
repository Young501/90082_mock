import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest, API_ENDPOINTS } from "@/api";
import {
  ConversationListResponseApi,
  ConversationResponse,
  ConversationSummary,
  conversationListItemToSummary,
  ListConversationsParams,
  ListMessagesParams,
  Message,
  MessageListResponseApi,
  messageListItemToMessage,
} from "@/types/messaging";
import { useAuthStore } from "@/store";

export function listConversations(
  params?: ListConversationsParams
): Promise<ConversationListResponseApi> {
  const query: Record<string, string | number | boolean> = {};
  if (params?.archived !== undefined) query.archived = params.archived;
  if (params?.cursor != null && params.cursor !== "") query.cursor = params.cursor;
  if (params?.opportunity_id != null) query.opportunity_id = params.opportunity_id;
  if (params?.page_size != null) query.page_size = params.page_size;
  return apiRequest({
    endpoint: API_ENDPOINTS.LIST_CONVERSATIONS(),
    params: Object.keys(query).length ? query : undefined,
  });
}

export function listMessages(
  conversationId: number,
  params?: ListMessagesParams
): Promise<MessageListResponseApi> {
  const query: Record<string, string | number> = {};
  if (params?.cursor != null && params.cursor !== "") query.cursor = params.cursor;
  if (params?.page_size != null) query.page_size = params.page_size;
  return apiRequest({
    endpoint: API_ENDPOINTS.LIST_MESSAGES(conversationId),
    params: Object.keys(query).length ? query : undefined,
  });
}

const CONVERSATIONS_QUERY_KEY = ["messaging", "conversations"];
const MESSAGES_QUERY_KEY = (id: number) => ["messaging", "conversations", id, "messages"];

export function useConversationsList(params?: ListConversationsParams) {
  return useQuery({
    queryKey: [...CONVERSATIONS_QUERY_KEY, params],
    queryFn: () => listConversations(params),
    staleTime: 30_000,
    select: (data): ConversationSummary[] =>
      data.results.map(conversationListItemToSummary),
  });
}

export function useConversationMessages(
  conversationId: number | null,
  params?: ListMessagesParams
) {
  const currentUserId = useAuthStore((s) => s.user?.id);
  const numericUserId =
    currentUserId != null ? Number(currentUserId) : undefined;

  return useQuery({
    queryKey: conversationId == null ? [] : [...MESSAGES_QUERY_KEY(conversationId), params],
    staleTime: 10_000,
    queryFn: () =>
      conversationId == null
        ? Promise.resolve({ next: null, previous: null, results: [] })
        : listMessages(conversationId, params),
    enabled: conversationId != null,
    select: (data): Message[] =>
      conversationId == null
        ? []
        : data.results.map((item) =>
            messageListItemToMessage(item, conversationId, numericUserId)
          ),
  });
}

export function useGetOrCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      other_user_id: number;
      opportunity_id?: number;
    }) =>
      apiRequest<ConversationResponse>({
        endpoint: API_ENDPOINTS.GET_OR_CREATE_CONVERSATION(),
        body: {
          other_user_id: data.other_user_id,
          ...(data.opportunity_id != null && {
            opportunity_id: data.opportunity_id,
          }),
        },
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      const conversationId = (data as any)?.id;
      if (conversationId != null) {
        queryClient.invalidateQueries({
          queryKey: MESSAGES_QUERY_KEY(conversationId),
        });
      }
    },
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      conversationId: number;
      content: string;
      files?: File[];
      replyToId?: number;
    }) => {
      // If sending files (optionally with text), send multipart/form-data
      if (data.files?.length) {
        const formData = new FormData();
        formData.append("content", data.content || "");
        if (data.replyToId != null) {
          formData.append("reply_to_id", String(data.replyToId));
        }
        // Append each file with files[] key for multiple attachments
        data.files.forEach((file) => formData.append("files[]", file));
        return apiRequest({
          endpoint: API_ENDPOINTS.SEND_MESSAGE(data.conversationId),
          body: formData,
        });
      }
      // If no files, send regular JSON
      return apiRequest({
        endpoint: API_ENDPOINTS.SEND_MESSAGE(data.conversationId),
        body: {
          content: data.content,
          ...(data.replyToId != null && { reply_to_id: data.replyToId }),
        },
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_QUERY_KEY(variables.conversationId) });
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
    },
  });
}

export function updateConversationArchiveState(
  conversationId: number,
  isArchived: boolean
): Promise<ConversationResponse> {
  return apiRequest({
    endpoint: API_ENDPOINTS.UPDATE_CONVERSATION_STATE(conversationId),
    body: { is_archived: isArchived },
  });
}

export function useToggleConversationArchive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { conversationId: number; isArchived: boolean }) =>
      updateConversationArchiveState(data.conversationId, data.isArchived),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: CONVERSATIONS_QUERY_KEY });
      queryClient.invalidateQueries({
        queryKey: MESSAGES_QUERY_KEY(variables.conversationId),
      });
    },
  });
}
