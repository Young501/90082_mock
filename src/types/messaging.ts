export type ConversationId = string;
export interface ConversationSummary {
  id: ConversationId;
  title: string;
  subtitle: string; 
  lastMessagePreview: string;
  lastActivityAt: string; 
  hasUnread: boolean;
  unreadCount: number;
  isArchived: boolean;
  opportunityId?: string | null;
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
