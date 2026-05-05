"use client";

import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Flex, VStack, HStack, Text, Spinner } from "@chakra-ui/react";
import { ButtonV2 } from "@/components/ui/ButtonV2";
import { MessageComposerInput } from "@/components/ui/MessageComposerInput";
import { MessageBox } from "./MessageBox";
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
import { validateContent } from "@/utils/contentValidation";
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
  profileType: "coordinator" | "organisation" | "student";
  hasMoreMessages?: boolean;
  onLoadMoreMessages?: () => void;
  isLoadingMoreMessages?: boolean;
  isSending?: boolean;
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

  useEffect(() => {
    if (!conversation?.avatar) return;
    const img = new window.Image();
    img.src = conversation.avatar;
  }, [conversation?.id, conversation?.avatar]);

  useLayoutEffect(() => {
    if (messagesLoading) return;
    const container = messagesContainerRef.current;
    if (!container) return;
    container.scrollTop = container.scrollHeight;
  }, [conversation?.id, lastMessageId, messagesLoading]);

  const isEmptyThread = orderedMessages.length === 0;

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setIsAttachmentOpen(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleOnChange = (value: string) => {
    // Clears error when typing new character
    if (error) {
      setError(null);
    }

    onComposerTextChange(value)
  }

  const handleSendWithFiles = () => {
    // Validate the text content before sending
    const validationResult = validateContent(composerText);
    if (validationResult.status === "error") {
      switch (validationResult.type) {
        case "profanity":
          setError("Please keep your language appropriate")
          break;
        case "spam-lowercase":
          setError("Please provide a meaningful response")
          break;
        case "spam-uppercase":
          setError("Please avoid writing in all capitals")
          break;
        case "link":
          setError("Please avoid including links in this field")
          break;
      }

      return;
    }

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
    >
      <ConversationHeader
        conversation={conversation}
        isSinglePane={isSinglePane}
        profileType={profileType}
        onBackToList={onBackToList}
        onToggleArchive={onToggleArchive}
      />

      <Box
        ref={messagesContainerRef}
        flex={1}
        minH="0"
        h="100%"
        overflowY="auto"
        px={4}
        py={4}
      >
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
          <VStack align="stretch" gap={{ base: 3, md: 6 }}>
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
                <MessageBox
                  key={message.id}
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
                />
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
        <HStack gap={2} align="flex-end">
          <MessageComposerInput
            value={composerText}
            onChange={handleOnChange}
            error={error}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendWithFiles();
              }
            }}
            attachmentDrawer={!!isSinglePane}
            attachmentOpen={isAttachmentOpen}
            onAttachmentOpenChange={setIsAttachmentOpen}
            onFilesSelected={handleFilesSelected}
          />

          <ButtonV2
            variant="primary"
            aria-label="Send message"
            colorScheme="blue"
            disabled={
              isSending ||
              (!composerText.trim() &&
                selectedFiles.length === 0 &&
                !replyToMessage) ||
              error !== null
            }
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
            <Text fontSize="sm" display={{ base: "none", md: "inline-block" }}>
              Send
            </Text>
          </ButtonV2>
        </HStack>
      </Box>
    </Box>
  );
};
