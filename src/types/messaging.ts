export interface MessagingUser {
  id: number;
  email: string;
  full_name: string;
  user_types: string[];
  profile_picture_url: string | null;
  organisation_name: string | null;
  organisation_logo_url: string | null;
  organisation_id: number | null;
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

export interface ReplyToPreviewApi {
  id: number;
  sender_id: number;
  content_preview: string;
  is_soft_deleted: boolean;
}

export interface MessageListItemApi {
  id: number;
  sender: MessagingUser;
  content: string;
  created_at: string;
  is_soft_deleted: boolean;
  reply_to_preview?: ReplyToPreviewApi | null;
  attachments?: MessageAttachment[];
  is_edited: boolean;
  edited_at: string | null;
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

export type ConversationId = number;

export interface ConversationSummary {
  id: ConversationId;
  otherUserId?: number;
  otherOrganisationId?: number | null;
  otherUserTypes: string[];
  organisationTitle?: string;
  otherUserName: string;
  organisationSubtitle: string;
  studentSubtitle: string;
  lastMessagePreview: string;
  lastActivityAt: string;
  hasUnread: boolean;
  unreadCount: number;
  isArchived: boolean;
  opportunityId?: number | null;
  avatar?: string | null;
  organisationLogo?: string | null;
  organisationMemberName?: string | null;
  opportunityTitle?: string | null;
  isMuted?: boolean;
  isBlocked?: boolean;
}

export interface MessageAttachment {
  id: string;
  original_filename: string;
  type: string;
  file_url: string;
  file_size: number;
  content_type: string;
  created_at: string;
}

export interface ReplyToPreview {
  id: number;
  senderId: number;
  contentPreview: string;
  isSoftDeleted: boolean;
}

export interface Message {
  id: string;
  conversationId: ConversationId;
  sender: "me" | "them";
  text?: string;
  attachments?: MessageAttachment[];
  createdAt: string;
  replyToPreview?: ReplyToPreview | null;
  messanger?: MessagingUser | null;
  isEdited?: boolean;
  editedAt?: string | null;
  isSoftDeleted?: boolean;
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
    otherUserId: item.other_user.id,
    otherOrganisationId: item.other_user.organisation_id,
    otherUserTypes: item.other_user.user_types ?? [],
    organisationTitle: item.other_user.organisation_name || "",
    otherUserName: item.other_user.full_name,
    organisationSubtitle:
      item.other_user.full_name ||
      item.opportunity_title ||
      item.other_user.organisation_name ||
      "",
    studentSubtitle: item.opportunity_title || "",
    lastMessagePreview: item.last_message?.content ?? "",
    lastActivityAt: item.last_message_at,
    hasUnread: item.has_unread,
    unreadCount: item.unread_count,
    isArchived: item.is_archived,
    opportunityId: item.opportunity_id,
    avatar: item.other_user.profile_picture_url ?? null,
    organisationLogo: item.other_user.organisation_logo_url ?? null,
    organisationMemberName: item.other_user.full_name ?? null,
    opportunityTitle: item.opportunity_title ?? null,
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
    messanger: item.sender,
    attachments: item.attachments?.map((att) => ({
      id: att.id,
      original_filename: att.original_filename,
      type: att.type,
      file_url: att.file_url,
      file_size: att.file_size,
      content_type: att.content_type,
      created_at: att.created_at,
    })),
    replyToPreview: item.reply_to_preview
      ? {
          id: item.reply_to_preview.id,
          senderId: item.reply_to_preview.sender_id,
          contentPreview: item.reply_to_preview.content_preview,
          isSoftDeleted: item.reply_to_preview.is_soft_deleted,
        }
      : null,
  };
}
