"use client";

import React, {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  Spinner,
  IconButton,
} from "@chakra-ui/react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { MessageComposerInput } from "@/components/ui/MessageComposerInput";
import { MessageBox, type MessageBoxPrototypeProps } from "./MessageBox";
import { ConversationHeader } from "./ConversationHeader";
import { EmptyConversationState } from "./EmptyConversationState";
import { ConversationReplyPreview } from "./ConversationReplyPreview";
import {
  ConversationId,
  ConversationSummary,
  Message,
} from "@/types/messaging";
import { useAuthStore } from "@/store";
import { Loader, Send } from "lucide-react";
import {
  validateContent,
  getContentValidationMessage,
} from "@/utils/contentValidation";
interface ConversationViewProps {
  isSinglePane: boolean | undefined;
  conversation: ConversationSummary | null;
  messages: Message[];
  composerText: string;
  onComposerTextChange: (value: string) => void;
  onSendMessage: (files?: File[], replyToId?: number) => void;
  onBackToList: () => void;
  onToggleArchive: (id: ConversationId) => void;
  messagesLoading?: boolean;
  profileType: "student" | "organisation";
  hasMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
  isLoadingMoreMessages?: boolean;
  isSending?: boolean;
  headerActionSlot?: ReactNode;
  headerNoticeSlot?: ReactNode;
  headerMenuSlot?: ReactNode;
  headerOptionsButtonStyle?: CSSProperties;
  headerOptionsButtonIndicator?: ReactNode;
  onHeaderOptionsOpen?: () => void;
  afterHeaderSlot?: ReactNode;
  workspaceHintSlot?: ReactNode;
  timelineSlotAfterMessageId?: string;
  timelineSlot?: ReactNode;
  overlaySlot?: ReactNode;
  composerLockedReason?: ReactNode;
  composerSendMode?: "external" | "inlineIcon";
  messagePrototype?: (message: Message) => MessageBoxPrototypeProps | undefined;
}

export const ConversationView = ({
  isSinglePane,
  conversation,
  messages,
  composerText,
  onComposerTextChange,
  onSendMessage,
  onBackToList,
  onToggleArchive,
  messagesLoading = false,
  profileType,
  hasMoreMessages = false,
  onLoadMoreMessages,
  isLoadingMoreMessages = false,
  isSending = false,
  headerActionSlot,
  headerNoticeSlot,
  headerMenuSlot,
  headerOptionsButtonStyle,
  headerOptionsButtonIndicator,
  onHeaderOptionsOpen,
  afterHeaderSlot,
  workspaceHintSlot,
  timelineSlotAfterMessageId,
  timelineSlot,
  overlaySlot,
  composerLockedReason,
  composerSendMode = "external",
  messagePrototype,
}: ConversationViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const messageRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [activeMessageActionsId, setActiveMessageActionsId] = useState<
    string | null
  >(null);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const currentUserId = useAuthStore((s: any) => s.user?.id);
  const numericUserId =
    currentUserId != null ? Number(currentUserId) : undefined;
  const [error, setError] = useState<string | null>(null);

  const orderedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const lastMessageId = orderedMessages[orderedMessages.length - 1]?.id;
  const hasTimelineSlot = Boolean(timelineSlot);

  useEffect(() => {
    if (!conversation?.avatar) return;
    const img = new window.Image();
    img.src = conversation.avatar;
  }, [conversation?.id, conversation?.avatar]);

  useLayoutEffect(() => {
    if (messagesLoading) return;
    const container = messagesContainerRef.current;
    if (!container) return;

    const frame = window.requestAnimationFrame(() => {
      container.scrollTop = container.scrollHeight;
      messagesEndRef.current?.scrollIntoView({ block: "end" });
    });

    return () => window.cancelAnimationFrame(frame);
  }, [
    conversation?.id,
    hasTimelineSlot,
    lastMessageId,
    messagesLoading,
    timelineSlotAfterMessageId,
  ]);

  const isEmptyThread = orderedMessages.length === 0;
  const isSendDisabled =
    !!composerLockedReason ||
    isSending ||
    (!composerText.trim() && selectedFiles.length === 0 && !replyToMessage) ||
    error !== null;

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setIsAttachmentOpen(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOnChange = (value: string) => {
    const result = validateContent(value);
    setError(
      result.status === "error"
        ? getContentValidationMessage(result.type)
        : null
    );
    onComposerTextChange(value);
  };

  const handleSendWithFiles = () => {
    if (error) return;

    const replyToId = replyToMessage ? Number(replyToMessage.id) : undefined;
    onSendMessage(
      selectedFiles.length > 0 ? selectedFiles : undefined,
      replyToId
    );
    setSelectedFiles([]);
    setReplyToMessage(null);
  };

  const handleReplyToMessage = (message: Message) => {
    setReplyToMessage(message);
    setIsAttachmentOpen(false);
    setActiveMessageActionsId(null);
  };

  const handleCancelReply = () => {
    setReplyToMessage(null);
  };

  const scrollToMessage = (messageId: string | number) => {
    const id = String(messageId);
    const messageElement = messageRefs.current.get(id);
    if (messageElement) {
      messageElement.scrollIntoView({ behavior: "smooth", block: "center" });
      messageElement.style.backgroundColor = "#F4F4F5";
      setTimeout(() => {
        messageElement.style.backgroundColor = "";
      }, 500);
    }
  };

  if (!conversation) {
    return (
      <EmptyConversationState
        isSinglePane={isSinglePane}
        onBackToList={onBackToList}
      />
    );
  }

  return (
    <Box
      w="100%"
      borderRadius="xl"
      borderWidth={{ base: "0px", lg: "1px" }}
      borderColor={{ base: "transparent", md: "#E4E4E7" }}
      bg="white"
      display="flex"
      flexDirection="column"
      h="100%"
      maxH={{ base: "calc(100vh - 90px)", lg: "calc(100vh - 188px)" }}
      position="relative"
    >
      <ConversationHeader
        conversation={conversation}
        isSinglePane={isSinglePane}
        onBackToList={onBackToList}
        onToggleArchive={onToggleArchive}
        actionSlot={headerActionSlot}
        noticeSlot={headerNoticeSlot}
        menuSlot={headerMenuSlot}
        optionsButtonStyle={headerOptionsButtonStyle}
        optionsButtonIndicator={headerOptionsButtonIndicator}
        onOptionsOpen={onHeaderOptionsOpen}
      />
      {afterHeaderSlot}

      <Box
        ref={messagesContainerRef}
        flex={1}
        minH="0"
        h="100%"
        overflowY="auto"
        px={4}
        py={4}
      >
        {workspaceHintSlot}
        {messagesLoading ? (
          <Flex w="100%" h="100%" minH="200px" align="center" justify="center">
            <Spinner size="md" />
          </Flex>
        ) : isEmptyThread ? (
          <VStack w="100%" h="100%" align="center" justify="center" gap={3}>
            <Text fontWeight="semibold">Start the conversation</Text>
            <Text
              fontSize="sm"
              color="gray.600"
              textAlign="center"
              maxW="320px"
            >
              There are no messages here yet. Send the first message to get
              things started.
            </Text>
          </VStack>
        ) : (
          <VStack align="stretch" gap={{ base: 3, md: 6 }} pb={3}>
            {hasMoreMessages && onLoadMoreMessages && (
              <Box
                display="flex"
                justifyContent="center"
                py={2}
                borderBottomWidth="1px"
                borderBottomColor="#E4E4E7"
              >
                <ButtonV2
                  variant="ghost"
                  onClick={onLoadMoreMessages}
                  disabled={isLoadingMoreMessages}
                  aria-label="Load older messages"
                  h="fit-content"
                  py={2}
                  px={4}
                >
                  {isLoadingMoreMessages ? (
                    <HStack gap={2}>
                      <Spinner size="sm" />
                      <Text fontSize="xs">Loading older messages...</Text>
                    </HStack>
                  ) : (
                    <Text fontSize="xs" color="#71717A">
                      Load older messages
                    </Text>
                  )}
                </ButtonV2>
              </Box>
            )}
            {orderedMessages.map((message) => {
              const isMine = message.sender === "me";
              const showActions = activeMessageActionsId === message.id;
              const prototype = messagePrototype?.(message);

              const handleHoverIn = () => {
                if (!isSinglePane) {
                  setActiveMessageActionsId(message.id);
                }
              };

              const handleHoverOut = () => {
                if (!isSinglePane) {
                  setActiveMessageActionsId((current) =>
                    current === message.id ? null : current
                  );
                }
              };

              const handleMessageClick = () => {
                if (isSinglePane) {
                  setActiveMessageActionsId((current) =>
                    current === message.id ? null : message.id
                  );
                }
              };

              return (
                <React.Fragment key={message.id}>
                  <MessageBox
                    message={message}
                    isMine={isMine}
                    profileType={profileType}
                    showActions={showActions}
                    isSinglePane={isSinglePane}
                    numericUserId={numericUserId}
                    opportunityId={conversation?.opportunityId}
                    onHoverIn={handleHoverIn}
                    onHoverOut={handleHoverOut}
                    onMessageClick={handleMessageClick}
                    onCloseActions={() => setActiveMessageActionsId(null)}
                    onReply={handleReplyToMessage}
                    onScrollToMessage={scrollToMessage}
                    messageRef={(el) => {
                      if (el) {
                        messageRefs.current.set(message.id, el);
                      } else {
                        messageRefs.current.delete(message.id);
                      }
                    }}
                    isCopied={isCopied}
                    onCopy={() => {
                      if (message.text) {
                        navigator.clipboard
                          ?.writeText(message.text)
                          .catch(() => undefined);
                        setIsCopied(true);
                        setTimeout(() => setIsCopied(false), 2000);
                      }
                    }}
                    prototype={prototype}
                  />
                  {timelineSlotAfterMessageId === message.id && timelineSlot}
                </React.Fragment>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {(selectedFiles.length > 0 || replyToMessage) && (
        <ConversationReplyPreview
          replyToMessage={replyToMessage}
          selectedFiles={selectedFiles}
          profileType={profileType}
          onCancelReply={handleCancelReply}
          onRemoveFile={handleRemoveFile}
        />
      )}

      <Box
        pt={5}
        pb={4}
        px={{ base: 4, md: 5 }}
        borderTopWidth="1px"
        borderColor="#E4E4E7"
        h="fit-content"
      >
        {composerLockedReason && (
          <Box
            mb={3}
            px={3}
            py={2}
            borderRadius="lg"
            borderWidth="1px"
            borderColor="#FECACA"
            bg="#FEF2F2"
          >
            <Text fontSize="sm" color="#991B1B" fontWeight="medium">
              {composerLockedReason}
            </Text>
          </Box>
        )}
        <HStack gap={2} align="center">
          <MessageComposerInput
            value={composerText}
            onChange={handleOnChange}
            error={error}
            placeholder={
              composerLockedReason
                ? "This conversation is blocked"
                : "Type your message..."
            }
            inputProps={{ disabled: !!composerLockedReason }}
            onKeyDown={(e) => {
              if (composerLockedReason) return;
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendWithFiles();
              }
            }}
            attachmentDrawer={!!isSinglePane}
            attachmentOpen={isAttachmentOpen}
            onAttachmentOpenChange={setIsAttachmentOpen}
            onFilesSelected={handleFilesSelected}
            actionAlign={
              composerSendMode === "inlineIcon" ? "center" : "flex-end"
            }
            sendControl={
              composerSendMode === "inlineIcon" ? (
                <IconButton
                  aria-label="Send message"
                  flexShrink={0}
                  h="36px"
                  minW="40px"
                  borderRadius="10px"
                  bg="profile.500"
                  color="white"
                  disabled={isSendDisabled}
                  _hover={{ bg: "profile.dark" }}
                  _active={{ transform: "scale(0.98)" }}
                  onClick={handleSendWithFiles}
                >
                  <Send
                    size={18}
                    style={{ transform: "translate(-1px, 1px)" }}
                  />
                </IconButton>
              ) : null
            }
          />

          {composerSendMode === "external" && (
            <ButtonV2
              variant="primary"
              aria-label="Send message"
              colorScheme="blue"
              disabled={isSendDisabled}
              onClick={handleSendWithFiles}
              flexShrink={0}
              h="40px"
              fontSize="sm"
              px={{ base: 2.5, md: 4 }}
              iconPosition="end"
              icon={<Send size={18} />}
              isLoading={isSending}
              // profileType={profileType}
            >
              <Text
                fontSize="sm"
                display={{ base: "none", md: "inline-block" }}
              >
                Send
              </Text>
            </ButtonV2>
          )}
        </HStack>
      </Box>
      {overlaySlot}
    </Box>
  );
};
