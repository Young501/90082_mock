"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Text,
  IconButton,
  Avatar,
  Tag,
  Spinner,
} from "@chakra-ui/react";
import IconUserPlaceholder from "@/components/Icons/IconUserPlaceholder";
import { ButtonV2 } from "@/components/ui/ButtonV2";

import { MenuPopover } from "@/components/ui/MenuPopover";
import { MessageComposerInput } from "@/components/ui/MessageComposerInput";

import {
  Archive,
  ArchiveRestore,
  Paperclip,
  Send,
  SmilePlus,
  MoreHorizontal,
  ChevronLeft,
  Pen,
  Search,
  EllipsisVertical,
  X,
  Reply,
} from "lucide-react";
import {
  ConversationId,
  ConversationSummary,
  Message,
} from "@/types/messaging";
import { formatRelativeTime } from "@/utils/formatDate";
import { useAuthStore } from "@/store";

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
}: ConversationViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [activeMessageActionsId, setActiveMessageActionsId] = useState<
    string | null
  >(null);
  const [isCopied, setIsCopied] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  const currentUserId = useAuthStore((s) => s.user?.id);
  const numericUserId =
    currentUserId != null ? Number(currentUserId) : undefined;
  console.log("ConversationView", conversation);

  // ordered oldest
  const orderedMessages = [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.id, orderedMessages.length]);

  const isEmptyThread = orderedMessages.length === 0;

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles((prev) => [...prev, ...files]);
    setIsAttachmentOpen(false);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSendWithFiles = () => {
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

  if (!conversation) {
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
        {isSinglePane && (
          <HStack
            px={{ base: 3, md: 4 }}
            py={3}
            borderBottomWidth="1px"
            borderColor="#E4E4E7"
            alignItems="center"
            gap={{ base: 2, md: 3 }}
          >
            <IconButton
              aria-label="back"
              variant="ghost"
              minW="fit-content"
              h="fit-content"
              onClick={onBackToList}
            >
              <ChevronLeft size={20} />
            </IconButton>
            <Text fontWeight="semibold" fontSize="sm" color="black">
              Messages
            </Text>
          </HStack>
        )}

        <Flex flex={1} align="center" justify="center" px={6} py={8}>
          <VStack maxW="360px" textAlign="center" gap={3}>
            <IconUserPlaceholder />
            <Text fontWeight="semibold" fontSize="md">
              Select a conversation to get started
            </Text>
            <Text fontSize="sm" color="gray.600">
              Choose a conversation from the list on the left to view messages
              here. If there are no conversations, start by reaching out to a
              contact.
            </Text>
          </VStack>
        </Flex>
      </Box>
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
      <HStack
        px={{ base: 3, md: 4 }}
        py={3}
        borderBottomWidth="1px"
        borderColor="#E4E4E7"
        alignItems="center"
        gap={{ base: 2, md: 3 }}
        h="fit-content"
      >
        {isSinglePane && (
          <IconButton
            aria-label="back"
            variant="ghost"
            minW="fit-content"
            h="fit-content"
            onClick={onBackToList}
          >
            <ChevronLeft size={20} />
          </IconButton>
        )}
        <Box
          w="32px"
          h="32px"
          borderRadius="full"
          display="flex"
          alignItems="center"
          justifyContent="center"
          fontWeight="semibold"
          flexShrink={0}
        >
          {conversation?.avatar && profileType === "organisation" ? (
            <Avatar.Root size="sm">
              <Avatar.Image
                src={conversation?.avatar ?? ""}
                alt={conversation?.studentTitle}
                w="32px"
                h="32px"
              />
              <Avatar.Fallback bg="#E4E4E7" color="black">
                {conversation?.studentTitle.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
          ) : (
            <Avatar.Root size="sm">
              <Avatar.Image
                src={conversation?.avatar ?? ""}
                alt={conversation?.organisationTitle ?? ""}
                w="32px"
                h="32px"
              />
              <Avatar.Fallback bg="#E4E4E7" color="black">
                {conversation?.organisationTitle?.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
          )}
          {/* <Image src={conversation.avatar} alt={conversation.title} /> */}
        </Box>
        <VStack align="flex-start" gap={0} flex={1} minW={0}>
          <Text fontWeight="semibold" color="black" fontSize="sm" truncate>
            {profileType === "organisation"
              ? conversation?.studentTitle
              : conversation?.organisationTitle}
          </Text>
          <HStack flexWrap="wrap">
            {profileType === "organisation" &&
              conversation?.studentSubtitle && (
                <Tag.Root>
                  <Tag.Label fontSize="xs" color="black" truncate>
                    {conversation?.studentSubtitle}
                  </Tag.Label>
                </Tag.Root>
              )}
            {profileType === "student" &&
              conversation?.organisationSubtitle && (
                <Tag.Root>
                  <Tag.Label fontSize="xs" color="black" truncate>
                    {conversation?.organisationSubtitle}
                  </Tag.Label>
                </Tag.Root>
              )}

            {/* TODO: EDIT FEATURE: PENDING API AVAILABILITY */}
            {/* <MenuPopover
              trigger={
                <IconButton
                  variant="ghost"
                  minW="fit-content"
                  aria-label="Conversation options"
                  h="fit-content"
                >
                  <Pen size={12} color="#71717A" />
                </IconButton>
              }
              placement="bottom-start"
            >
              <HStack
                gap={2}
                cursor="pointer"
                px={2}
                py={1}
                borderRadius="md"
                _hover={{ bg: "#F4F4F5" }}
                onClick={() =>
                  conversation?.id != null
                    ? onToggleArchive(conversation.id)
                    : undefined
                }
              >
                {conversation?.isArchived ? (
                  <ArchiveRestore size={16} color="#111827" />
                ) : (
                  <Archive size={16} color="#111827" />
                )}
                <Text fontSize="sm" color="#111827">
                  {conversation?.isArchived ? "Unarchive chat" : "Archive chat"}
                </Text>
              </HStack>
            </MenuPopover> */}
          </HStack>
        </VStack>

        <HStack>
          <IconButton
            aria-label="Search"
            variant="ghost"
            minW="fit-content"
            h="fit-content"
          >
            <Search size={20} color="#71717A" />
          </IconButton>

          <MenuPopover
            trigger={
              <IconButton
                variant="ghost"
                minW="fit-content"
                aria-label="Conversation options"
                h="fit-content"
                onClick={(e) => e.stopPropagation()}
              >
                <EllipsisVertical size={20} color="#71717A" />
              </IconButton>
            }
            placement="bottom-start"
          >
            <HStack
              gap={2}
              cursor="pointer"
              px={2}
              py={1}
              borderRadius="md"
              _hover={{ bg: "#F4F4F5" }}
              onClick={(e) => {
                e.stopPropagation();
                if (conversation?.id != null) onToggleArchive(conversation.id);
              }}
            >
              <Text fontSize="sm" color="#111827">
                {conversation?.isArchived ? "Unarchive chat" : "Archive chat"}
              </Text>
            </HStack>
          </MenuPopover>
        </HStack>
      </HStack>

      <Box
        flex={1}
        // minH={0}
        // maxH="calc(100vh - 435px)"
        // maxH="100vh"
        minH="0"
        h="100%"
        // maxH="100%"
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

              return (
                <Box
                  key={message.id}
                  display="flex"
                  justifyContent={isMine ? "flex-end" : "flex-start"}
                  onMouseEnter={handleHoverIn}
                  onMouseLeave={handleHoverOut}
                  onClick={() => {
                    if (isSinglePane) {
                      setActiveMessageActionsId((current) =>
                        current === message.id ? null : message.id
                      );
                    }
                  }}
                >
                  <Box
                    maxW="100%"
                    display="flex"
                    flexDirection="row"
                    gap={1}
                    alignItems="center"
                    w="100%"
                    justifyContent={isMine ? "flex-end" : "flex-start"}
                  >
                    <VStack gap={1}>
                      <HStack
                        alignItems="center"
                        gap={1}
                        // justifyContent={isMine ? "flex-end" : "flex-start"}
                      >
                        {isMine && (
                          <HStack
                            justifyContent={isMine ? "flex-end" : "flex-start"}
                            opacity={showActions ? 1 : 0}
                            transition="opacity 0.15s ease"
                            flexShrink={0}
                          >
                            {/* TODO: REACT TO MESSAGE FEATURE: PENDING API AVAILABILITY */}
                            {/* <IconButton
                              variant="ghost"
                              minW="fit-content"
                              aria-label="React to message"
                              h="fit-content"
                            >
                              <SmilePlus
                                size={16}
                                color={isMine ? "#1F97D1" : "#4B5563"}
                              />
                            </IconButton> */}
                            <MenuPopover
                              variant={isSinglePane ? "drawer" : "popover"}
                              title="Message actions"
                              open={isSinglePane ? showActions : undefined}
                              placement="left-start"
                              onOpenChange={
                                isSinglePane
                                  ? (v) => !v && setActiveMessageActionsId(null)
                                  : undefined
                              }
                              trigger={
                                <IconButton
                                  variant="ghost"
                                  minW="fit-content"
                                  h="fit-content"
                                  aria-label="Message actions"
                                  onClick={() =>
                                    isSinglePane
                                      ? setActiveMessageActionsId((current) =>
                                          current === message.id
                                            ? null
                                            : message.id
                                        )
                                      : undefined
                                  }
                                >
                                  <MoreHorizontal
                                    size={16}
                                    color={isMine ? "#1679AB" : "#4B5563"}
                                  />
                                </IconButton>
                              }
                            >
                              {/* <ButtonV2
                                variant="ghost"
                                minW="fit-content"
                                h="fit-content"
                                display="flex"
                                alignItems="start"
                                justifyContent="start"
                                aria-label="Copy message"
                                px={2}
                                py={0}
                                color="black"
                                textDecoration="none"
                                _hover={{
                                  textDecoration: "none",
                                }}
                                gap={2}
                                cursor="pointer"
                              >
                                <Text fontSize="sm">Reply</Text>
                              </ButtonV2> */}
                              <ButtonV2
                                variant="ghost"
                                minW="fit-content"
                                h="fit-content"
                                display="flex"
                                alignItems="start"
                                justifyContent="start"
                                aria-label="Copy message"
                                px={2}
                                py={0}
                                color="black"
                                textDecoration="none"
                                _hover={{
                                  textDecoration: "none",
                                }}
                                onClick={() => {
                                  if (message.text) {
                                    navigator.clipboard
                                      ?.writeText(message.text)
                                      .catch(() => undefined);
                                    setIsCopied(true);
                                    setTimeout(() => {
                                      setIsCopied(false);
                                    }, 2000);
                                  }
                                }}
                              >
                                {isCopied ? (
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={
                                      profileType === "organisation"
                                        ? "#3AADA8"
                                        : "#1F97D1"
                                    }
                                  >
                                    Copied
                                  </Text>
                                ) : (
                                  <Text fontSize="sm">Copy</Text>
                                )}
                              </ButtonV2>
                              {/* TODO: EDIT MESSAGE FEATURE: PENDING API AVAILABILITY */}
                              {/* <HStack gap={2} cursor="pointer" px={2} py={1}>
                                <Text fontSize="sm">Edit</Text>
                              </HStack>
                              {/* TODO: STAR MESSAGE FEATURE: PENDING API AVAILABILITY */}
                              {/* <HStack gap={2} cursor="pointer" px={2} py={1}>
                                <Text fontSize="sm">Star</Text>
                              </HStack> */}
                              <Box
                                mt={1}
                                borderTopWidth="1px"
                                borderTopColor="#E4E4E7"
                              />
                              <HStack gap={2} cursor="pointer" px={2} py={1}>
                                <Text fontSize="sm" color="red.500">
                                  Delete message
                                </Text>
                              </HStack>
                            </MenuPopover>
                          </HStack>
                        )}

                        <Box
                          borderRadius="xl"
                          px={4}
                          py={3}
                          bg={
                            isMine
                              ? profileType === "organisation"
                                ? "#3AADA8"
                                : "#1F97D1"
                              : "#F4F4F5"
                          }
                          color={isMine ? "white" : "#18181B"}
                          maxW="396px"
                          w="100%"
                          borderWidth="1px"
                          borderColor={
                            isMine
                              ? profileType === "organisation"
                                ? "#3AADA8"
                                : "#1F97D1"
                              : "#E4E4E7"
                          }
                          style={{
                            borderRadius: isMine
                              ? "12px 0px 12px 12px"
                              : "0px 12px 12px 12px",
                          }}
                        >
                          {message.replyToPreview && (
                            <Box
                              mb={2}
                              pb={2}
                              borderBottomWidth="1px"
                              borderBottomColor={
                                isMine
                                  ? "rgba(255, 255, 255, 0.3)"
                                  : "rgba(0, 0, 0, 0.1)"
                              }
                            >
                              <HStack gap={2} align="flex-start">
                                <Box
                                  w="3px"
                                  h="100%"
                                  bg={
                                    isMine
                                      ? "rgba(255, 255, 255, 0.5)"
                                      : profileType === "organisation"
                                        ? "#3AADA8"
                                        : "#1F97D1"
                                  }
                                  borderRadius="sm"
                                  flexShrink={0}
                                />
                                <VStack
                                  align="flex-start"
                                  gap={0}
                                  flex={1}
                                  minW={0}
                                >
                                  <HStack gap={1}>
                                    <Reply
                                      size={12}
                                      color={
                                        isMine
                                          ? "rgba(255, 255, 255, 0.8)"
                                          : profileType === "organisation"
                                            ? "#3AADA8"
                                            : "#1F97D1"
                                      }
                                    />
                                    <Text
                                      fontSize="xs"
                                      fontWeight="semibold"
                                      color={
                                        isMine
                                          ? "rgba(255, 255, 255, 0.9)"
                                          : profileType === "organisation"
                                            ? "#3AADA8"
                                            : "#1F97D1"
                                      }
                                    >
                                      {message.replyToPreview.isSoftDeleted
                                        ? "Deleted message"
                                        : message.replyToPreview.senderId ===
                                            numericUserId
                                          ? "Replying to your message"
                                          : "Replying to message"}
                                    </Text>
                                  </HStack>
                                  {!message.replyToPreview.isSoftDeleted && (
                                    <Text
                                      fontSize="xs"
                                      color={
                                        isMine
                                          ? "rgba(255, 255, 255, 0.8)"
                                          : "#71717A"
                                      }
                                      overflow="hidden"
                                      textOverflow="ellipsis"
                                      display="-webkit-box"
                                      style={{
                                        WebkitLineClamp: 2,
                                        WebkitBoxOrient: "vertical",
                                      }}
                                    >
                                      {message.replyToPreview.contentPreview}
                                    </Text>
                                  )}
                                </VStack>
                              </HStack>
                            </Box>
                          )}
                          {message.text && (
                            <Text fontSize="sm" whiteSpace="pre-wrap">
                              {message.text}
                            </Text>
                          )}
                          {message.attachments &&
                            message.attachments.length > 0 && (
                              <VStack
                                align="flex-start"
                                gap={1}
                                mt={message.text ? 2 : 0}
                              >
                                {message.attachments.map((att) => (
                                  <HStack key={att.id} gap={2}>
                                    <Paperclip
                                      size={14}
                                      color={isMine ? "white" : "#4B5563"}
                                    />
                                    <Text
                                      fontSize="xs"
                                      textDecoration="underline"
                                    >
                                      {att.name}
                                    </Text>
                                  </HStack>
                                ))}
                              </VStack>
                            )}
                        </Box>
                        {!isMine && (
                          <HStack
                            justifyContent={isMine ? "flex-end" : "flex-start"}
                            opacity={showActions ? 1 : 0}
                            transition="opacity 0.15s ease"
                            flexShrink={0}
                          >
                            {/* TODO: REACT TO MESSAGE FEATURE: PENDING API AVAILABILITY */}
                            {/* <IconButton
                              aria-label="React to message"
                              variant="ghost"
                              minW="fit-content"
                              h="fit-content"
                            >
                              <SmilePlus
                                size={16}
                                color={isMine ? "#1679AB" : "#4B5563"}
                              />
                            </IconButton> */}
                            <MenuPopover
                              variant={isSinglePane ? "drawer" : "popover"}
                              title="Message actions"
                              open={isSinglePane ? showActions : undefined}
                              onOpenChange={
                                isSinglePane
                                  ? (v) => !v && setActiveMessageActionsId(null)
                                  : undefined
                              }
                              trigger={
                                <IconButton
                                  variant="ghost"
                                  minW="fit-content"
                                  h="fit-content"
                                  aria-label="Message actions"
                                  onClick={() =>
                                    isSinglePane
                                      ? setActiveMessageActionsId((current) =>
                                          current === message.id
                                            ? null
                                            : message.id
                                        )
                                      : undefined
                                  }
                                >
                                  <MoreHorizontal
                                    size={16}
                                    color={isMine ? "#1679AB" : "#4B5563"}
                                  />
                                </IconButton>
                              }
                            >
                              <ButtonV2
                                variant="ghost"
                                minW="fit-content"
                                h="fit-content"
                                display="flex"
                                alignItems="start"
                                justifyContent="start"
                                aria-label="Reply to message"
                                px={2}
                                py={0}
                                color="black"
                                textDecoration="none"
                                _hover={{
                                  textDecoration: "none",
                                }}
                                gap={2}
                                cursor="pointer"
                                onClick={() => handleReplyToMessage(message)}
                              >
                                <Text fontSize="sm">Reply</Text>
                              </ButtonV2>
                              <ButtonV2
                                variant="ghost"
                                minW="fit-content"
                                h="fit-content"
                                display="flex"
                                alignItems="start"
                                justifyContent="start"
                                aria-label="Copy message"
                                px={2}
                                py={0}
                                color="black"
                                textDecoration="none"
                                _hover={{
                                  textDecoration: "none",
                                }}
                                onClick={() => {
                                  if (message.text) {
                                    navigator.clipboard
                                      ?.writeText(message.text)
                                      .catch(() => undefined);
                                    setIsCopied(true);
                                    setTimeout(() => {
                                      setIsCopied(false);
                                    }, 2000);
                                  }
                                }}
                              >
                                {isCopied ? (
                                  <Text
                                    fontSize="sm"
                                    fontWeight="semibold"
                                    color={
                                      profileType === "organisation"
                                        ? "#3AADA8"
                                        : "#1F97D1"
                                    }
                                  >
                                    Copied
                                  </Text>
                                ) : (
                                  <Text fontSize="sm">Copy</Text>
                                )}
                              </ButtonV2>
                              {/* TODO: EDIT MESSAGE FEATURE: PENDING API AVAILABILITY */}
                              {/* <HStack gap={2} cursor="pointer" px={2} py={1}>
                                <Text fontSize="sm">Edit</Text>
                              </HStack> */}
                              {/* TODO: STAR MESSAGE FEATURE: PENDING API AVAILABILITY */}
                              {/* <HStack gap={2} cursor="pointer" px={2} py={1}>
                                <Text fontSize="sm">Star</Text>
                              </HStack> */}
                              <Box
                                mt={1}
                                borderTopWidth="1px"
                                borderTopColor="#E4E4E7"
                              />
                              <HStack gap={2} cursor="pointer" px={2} py={1}>
                                <Text fontSize="sm" color="red.500">
                                  Delete message
                                </Text>
                              </HStack>
                            </MenuPopover>
                          </HStack>
                        )}
                      </HStack>
                      <Text
                        mt={1}
                        flexShrink={0}
                        whiteSpace="nowrap"
                        alignSelf={isMine ? "flex-end" : "flex-start"}
                        fontSize="10px"
                        color="#52525B"
                        textAlign={isMine ? "right" : "left"}
                      >
                        {formatRelativeTime(message.createdAt)}
                      </Text>
                    </VStack>

                    <Box></Box>
                  </Box>
                  {/* </Box> */}
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      {(selectedFiles.length > 0 || replyToMessage) && (
        <Box
          px={{ base: 4, md: 5 }}
          pt={3}
          pb={2}
          borderTopWidth="1px"
          borderColor="#E4E4E7"
        >
          <VStack align="stretch" gap={2}>
            {replyToMessage && (
              <Box
                px={3}
                py={2}
                bg={profileType === "organisation" ? "#14B8A6" : "#EFF6FF"}
                borderRadius="md"
                position="relative"
              >
                <HStack justify="space-between" align="flex-start" gap={2}>
                  <VStack align="flex-start" gap={1} flex={1} minW={0}>
                    <HStack gap={2}>
                      <Reply
                        size={14}
                        color={
                          profileType === "organisation" ? "#FFFFFF" : "#1679AB"
                        }
                      />
                      <Text
                        fontSize="xs"
                        fontWeight="semibold"
                        color={
                          profileType === "organisation" ? "#FFFFFF" : "#1679AB"
                        }
                      >
                        Replying to{" "}
                        {replyToMessage.sender === "me"
                          ? "yourself"
                          : "message"}
                      </Text>
                    </HStack>
                    <Text
                      fontSize="sm"
                      color="#111827"
                      overflow="hidden"
                      textOverflow="ellipsis"
                      display="-webkit-box"
                      style={{
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}
                    >
                      {replyToMessage.text || "Message with attachment"}
                    </Text>
                  </VStack>
                  <IconButton
                    aria-label="Cancel reply"
                    variant="ghost"
                    size="sm"
                    minW="fit-content"
                    h="fit-content"
                    onClick={handleCancelReply}
                  >
                    <X size={16} color="#71717A" />
                  </IconButton>
                </HStack>
              </Box>
            )}
            {selectedFiles.map((file, index) => (
              <HStack
                key={`${file.name}-${index}`}
                gap={2}
                px={3}
                py={2}
                bg="#F4F4F5"
                borderRadius="md"
                justify="space-between"
              >
                <HStack gap={2} minW={0} flex={1}>
                  <Paperclip size={16} color="#52525B" />
                  <Text fontSize="sm" color="#111827" truncate>
                    {file.name}
                  </Text>
                  <Text fontSize="xs" color="#71717A">
                    ({(file.size / 1024).toFixed(1)} KB)
                  </Text>
                </HStack>
                <IconButton
                  aria-label="Remove file"
                  variant="ghost"
                  size="sm"
                  minW="fit-content"
                  h="fit-content"
                  onClick={() => handleRemoveFile(index)}
                >
                  <X size={16} color="#71717A" />
                </IconButton>
              </HStack>
            ))}
          </VStack>
        </Box>
      )}
      <Box
        pt={5}
        pb={4}
        px={{ base: 4, md: 5 }}
        borderTopWidth="1px"
        borderColor="#E4E4E7"
        h="fit-content"
      >
        <HStack gap={2} align="stretch">
          <MessageComposerInput
            value={composerText}
            onChange={onComposerTextChange}
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
              !composerText.trim() &&
              selectedFiles.length === 0 &&
              !replyToMessage
            }
            onClick={handleSendWithFiles}
            flexShrink={0}
            h="40px"
            fontSize="sm"
            px={{ base: 2.5, md: 4 }}
            iconPosition="end"
            icon={<Send size={18} />}
            profileType={profileType}
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
