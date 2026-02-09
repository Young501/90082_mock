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
  onSendMessage: () => void;
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
  console.log("ConversationView", conversation);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation?.id, messages.length]);

  const isEmptyThread = messages.length === 0;

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
    >
      <HStack
        px={{ base: 3, md: 4 }}
        py={3}
        borderBottomWidth="1px"
        borderColor="#E4E4E7"
        alignItems="center"
        gap={{ base: 2, md: 3 }}
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
          <IconButton
            aria-label="More options"
            variant="ghost"
            minW="fit-content"
            h="fit-content"
          >
            <EllipsisVertical size={20} color="#71717A" />
          </IconButton>
        </HStack>
      </HStack>

      <Box flex={1} overflowY="auto" px={4} py={4} maxH="calc(100vh - 260px)">
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
            {messages.map((message) => {
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

      <Box
        pt={5}
        pb={4}
        px={{ base: 4, md: 5 }}
        borderTopWidth="1px"
        borderColor="#E4E4E7"
      >
        <HStack gap={2} align="stretch">
          <MessageComposerInput
            value={composerText}
            onChange={onComposerTextChange}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
            attachmentDrawer={!!isSinglePane}
            attachmentOpen={isAttachmentOpen}
            onAttachmentOpenChange={setIsAttachmentOpen}
          />

          <ButtonV2
            variant="primary"
            aria-label="Send message"
            colorScheme="blue"
            disabled={!composerText.trim()}
            onClick={onSendMessage}
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
