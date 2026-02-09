// —— API response types (match backend) ——

export interface MessagingUser {
  id: number;
  email: string;
  full_name: string;
  profile_picture_url: string | null;
  organisation_name: string | null;
  organisation_logo_url: string | null;
}

export interface LastMessageApi {
  id: number;
  sender: MessagingUser;
  content: string;
  created_at: string;
  is_soft_deleted: boolean;
}

export interface ConversationListItemApi {
  id: number;
  other_user: MessagingUser;
  opportunity_id: number;
  opportunity_title: string;
  last_message: LastMessageApi | null;
  last_message_at: string;
  has_unread: boolean;
  unread_count: number;
  is_archived: boolean;
  created_at: string;
}

export interface PaginatedResponse<T> {
  next: string | null;
  previous: string | null;
  results: T[];
}

export type ConversationListResponseApi =
  PaginatedResponse<ConversationListItemApi>;

export interface MessageListItemApi {
  id: number;
  sender: MessagingUser;
  content: string;
  created_at: string;
  is_soft_deleted: boolean;
}

export type MessageListResponseApi = PaginatedResponse<MessageListItemApi>;

// —— API request params ——

export interface ListConversationsParams {
  archived?: boolean;
  cursor?: string;
  opportunity_id?: number;
  page_size?: number;
}

export interface ListMessagesParams {
  cursor?: string;
  page_size?: number;
}

// —— UI types (used by components) ——

export type ConversationId = number;

export interface ConversationSummary {
  id: ConversationId;
  organisationTitle?: string;
  studentTitle: string;
  organisationSubtitle: string;
  studentSubtitle: string;
  lastMessagePreview: string;
  lastActivityAt: string;
  hasUnread: boolean;
  unreadCount: number;
  isArchived: boolean;
  opportunityId?: number | null;
  avatar?: string | null;
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
}

export interface Message {
  id: string;
  conversationId: ConversationId;
  sender: "me" | "them";
  text?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
}

export type MessagesByConversation = Record<ConversationId, Message[]>;

export interface ContactMember {
  id?: number;
  first_name?: string;
  last_name?: string;
  profile_picture_url?: string | null;
  role?: string;
}

export interface ContactFormData {
  other_user_id: number;
  subject: string;
  message: string;
}

export interface ConversationResponse {
  id: number;
  [key: string]: unknown;
}


export function conversationListItemToSummary(
  item: ConversationListItemApi
): ConversationSummary {
  return {
    id: item.id,
    organisationTitle: item.other_user.organisation_name || "",
    studentTitle: item.other_user.full_name,
    organisationSubtitle: item.other_user.full_name || (item.opportunity_title || item.other_user.organisation_name || ""),
    studentSubtitle: item.opportunity_title || "",
    lastMessagePreview: item.last_message?.content ?? "",
    lastActivityAt: item.last_message_at,
    hasUnread: item.has_unread,
    unreadCount: item.unread_count,
    isArchived: item.is_archived,
    opportunityId: item.opportunity_id,
    avatar: item.other_user.profile_picture_url ?? null,
  };
}

export function messageListItemToMessage(
  item: MessageListItemApi,
  conversationId: ConversationId,
  currentUserId: number | undefined
): Message {
  const isMe = currentUserId != null && item.sender.id === currentUserId;
  return {
    id: String(item.id),
    conversationId,
    sender: isMe ? "me" : "them",
    text: item.is_soft_deleted ? undefined : item.content,
    createdAt: item.created_at,
  };
}
