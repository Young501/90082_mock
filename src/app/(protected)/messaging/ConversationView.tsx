"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Avatar,
  Tag,
} from "@chakra-ui/react";
import IconUserPlaceholder from "@/components/Icons/IconUserPlaceholder";

import { MenuPopover } from "@/components/ui/MenuPopover";

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

interface ConversationViewProps {
  isSinglePane: boolean | undefined;
  conversation: ConversationSummary | null;
  messages: Message[];
  // hasAnyConversations: boolean;
  composerText: string;
  onComposerTextChange: (value: string) => void;
  onSendMessage: () => void;
  onBackToList: () => void;
  onToggleArchive: (id: ConversationId) => void;
}

export const ConversationView = ({
  isSinglePane,
  conversation,
  messages,
  // hasAnyConversations,
  composerText,
  onComposerTextChange,
  onSendMessage,
  onBackToList,
  onToggleArchive,
}: ConversationViewProps) => {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const [isAttachmentOpen, setIsAttachmentOpen] = useState(false);
  const [activeMessageActionsId, setActiveMessageActionsId] = useState<
    string | null
  >(null);

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
      borderWidth={{ base: "0px", md: "1px" }}
      borderColor={{ base: "transparent", md: "#E4E4E7" }}
      // border={{ base: "none", md: "1px solid #E4E4E7" }}
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
        // display="flex"
        alignItems="center"
        gap={{ base: 2, md: 3 }}
      >
        {/* // chakra button and iconbutton behavious adds minimum width to the icons */}
        {isSinglePane && (
          <Box as="button" onClick={onBackToList}>
            <ChevronLeft size={20} />
          </Box>
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
          {/* <IconUserPlaceholder /> */}
          {/* {conversation.title.slice(0, 2).toUpperCase()} */}
          {conversation?.avatar ? (
            <Avatar.Image
              src={conversation?.avatar}
              alt={conversation?.title}
            />
          ) : (
            <IconUserPlaceholder />
          )}
          {/* <Image src={conversation.avatar} alt={conversation.title} /> */}
        </Box>
        <VStack align="flex-start" gap={0} flex={1} minW={0}>
          <Text fontWeight="semibold" color="black" fontSize="sm" truncate>
            {conversation?.title}
          </Text>
          <HStack flexWrap="wrap">
            <Text fontSize="xs" color="#2563EB" truncate>
              {conversation?.subtitle}
            </Text>
            <Tag.Root>
              <Tag.Label fontSize="xs" color="black" truncate>
                Employment Demo
              </Tag.Label>
            </Tag.Root>
            <MenuPopover
              trigger={
                <Box as="button" aria-label="Conversation options">
                  <Pen size={12} color="#71717A" />
                </Box>
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
            </MenuPopover>
          </HStack>
        </VStack>
        {/* <IconButton
          aria-label={
            conversation?.isArchived
              ? "Unarchive conversation"
              : "Archive conversation"
          }
          variant="ghost"
          onClick={() => onToggleArchive(conversation?.id ?? "")}
        >
          {conversation?.isArchived ? (
            <ArchiveRestore size={18} />
          ) : (
            <Archive size={18} />
          )}
        </IconButton> */}
        <HStack>
          <Box as="button">
            <Search size={20} color="#71717A" />
          </Box>
          <Box as="button">
            <EllipsisVertical size={20} color="#71717A" />
          </Box>
        </HStack>
      </HStack>

      <Box flex={1} overflowY="auto" px={4} py={4} maxH="calc(100vh - 260px)">
        {isEmptyThread ? (
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
                    <Hstack>
                      
                    </Hstack>
                    <HStack
                      justifyContent={isMine ? "flex-end" : "flex-start"}
                      opacity={showActions ? 1 : 0}
                      transition="opacity 0.15s ease"
                      flexShrink={0}
                    >
                      <Box aria-label="React to message" as="button">
                        <SmilePlus
                          size={16}
                          color={isMine ? "#1679AB" : "#4B5563"}
                        />
                      </Box>
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
                          <Box
                            as="button"
                            aria-label="Message actions"
                            onClick={() =>
                              isSinglePane
                                ? setActiveMessageActionsId((current) =>
                                    current === message.id ? null : message.id
                                  )
                                : undefined
                            }
                          >
                            <MoreHorizontal
                              size={16}
                              color={isMine ? "#1679AB" : "#4B5563"}
                            />
                          </Box>
                        }
                      >
                        <HStack gap={2} cursor="pointer" px={2} py={1}>
                          <Text fontSize="sm">Reply</Text>
                        </HStack>
                        <HStack
                          gap={2}
                          cursor="pointer"
                          px={2}
                          py={1}
                          onClick={() => {
                            if (message.text) {
                              navigator.clipboard
                                ?.writeText(message.text)
                                .catch(() => undefined);
                            }
                          }}
                        >
                          <Text fontSize="sm">Copy</Text>
                        </HStack>
                        <HStack gap={2} cursor="pointer" px={2} py={1}>
                          <Text fontSize="sm">Edit</Text>
                        </HStack>
                        <HStack gap={2} cursor="pointer" px={2} py={1}>
                          <Text fontSize="sm">Star</Text>
                        </HStack>
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

                    <VStack align="flex-end" gap={1}>
                      <Box
                        borderRadius="xl"
                        px={3}
                        py={2}
                        bg={isMine ? "#1679AB" : "#F4F4F5"}
                        color={isMine ? "white" : "#18181B"}
                        maxW="396px"
                        w="100%"
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
                      <Text
                        mt={1}
                        fontSize="10px"
                        color="gray.500"
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

      <Box px={4} py={3} borderTopWidth="1px" borderColor="#E4E4E7">
        <HStack gap={2}>
          <MenuPopover
            variant={isSinglePane ? "drawer" : "popover"}
            placement="top-start"
            title="Attach"
            open={isSinglePane ? isAttachmentOpen : undefined}
            onOpenChange={isSinglePane ? setIsAttachmentOpen : undefined}
            trigger={
              <IconButton
                aria-label="Attach file"
                variant="ghost"
                onClick={() =>
                  isSinglePane ? setIsAttachmentOpen(true) : undefined
                }
              >
                <Paperclip size={18} />
              </IconButton>
            }
            contentProps={isSinglePane ? { p: 4 } : { p: 3 }}
          >
            <VStack align="stretch" gap={2}>
              <HStack
                gap={3}
                cursor="pointer"
                onClick={() => isSinglePane && setIsAttachmentOpen(false)}
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="#EFF6FF"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Paperclip size={16} color="#1679AB" />
                </Box>
                <Text fontSize="sm" color="#111827">
                  Share documents
                </Text>
              </HStack>
              <HStack
                gap={3}
                cursor="pointer"
                onClick={() => isSinglePane && setIsAttachmentOpen(false)}
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="#EFF6FF"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Paperclip size={16} color="#1679AB" />
                </Box>
                <Text fontSize="sm" color="#111827">
                  Share videos
                </Text>
              </HStack>
              <HStack
                gap={3}
                cursor="pointer"
                onClick={() => isSinglePane && setIsAttachmentOpen(false)}
              >
                <Box
                  w={8}
                  h={8}
                  borderRadius="full"
                  bg="#EFF6FF"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  <Paperclip size={16} color="#1679AB" />
                </Box>
                <Text fontSize="sm" color="#111827">
                  Share photos
                </Text>
              </HStack>
            </VStack>
          </MenuPopover>
          <Input
            placeholder="Type your message"
            value={composerText}
            onChange={(e) => onComposerTextChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSendMessage();
              }
            }}
          />
          <IconButton
            aria-label="Send message"
            colorScheme="blue"
            disabled={!composerText.trim()}
            onClick={onSendMessage}
          >
            <Send size={18} />
          </IconButton>
        </HStack>
      </Box>
    </Box>
  );
};
