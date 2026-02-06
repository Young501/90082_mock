"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  VStack,
  HStack,
  Text,
  Input,
  IconButton,
  Portal,
  Popover,
} from "@chakra-ui/react";
import {
  Archive,
  ArchiveRestore,
  ArrowLeft,
  Paperclip,
  Send,
  MessageCircleX,
  SmilePlus,
  MoreHorizontal,
} from "lucide-react";
import { ConversationSummary, Message } from "@/types/messaging";
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
  onToggleArchive: (id: string | null) => void;
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
      borderWidth="1px"
      borderColor="#E4E4E7"
      bg="white"
      display="flex"
      flexDirection="column"
      h="100%"
    >
      <Box
        px={4}
        py={3}
        borderBottomWidth="1px"
        borderColor="#E4E4E7"
        display="flex"
        alignItems="center"
        gap={3}
      >
        {isSinglePane && (
          <IconButton
            aria-label="Back to conversations"
            variant="ghost"
            onClick={onBackToList}
          >
            <ArrowLeft size={18} />
          </IconButton>
        )}
        <VStack align="flex-start" gap={0} flex={1} minW={0}>
          <Text fontWeight="semibold" fontSize="sm" truncate>
            {conversation?.title}
          </Text>
          <Text fontSize="xs" color="gray.500" truncate>
            {conversation?.subtitle}
          </Text>
        </VStack>
        <IconButton
          aria-label={
            conversation?.isArchived
              ? "Unarchive conversation"
              : "Archive conversation"
          }
          variant="ghost"
          onClick={() => onToggleArchive(conversation?.id ?? null)}
        >
          {conversation?.isArchived ? (
            <ArchiveRestore size={18} />
          ) : (
            <Archive size={18} />
          )}
        </IconButton>
      </Box>

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
          <VStack align="stretch" gap={3}>
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
                  <Box maxW="80%">
                    <HStack
                      mb={1}
                      justifyContent={isMine ? "flex-end" : "flex-start"}
                      opacity={showActions ? 1 : 0}
                      transition="opacity 0.15s ease"
                    >
                      <IconButton
                        aria-label="React to message"
                        size="xs"
                        variant="ghost"
                      >
                        <SmilePlus
                          size={16}
                          color={isMine ? "#1679AB" : "#4B5563"}
                        />
                      </IconButton>
                      {isSinglePane ? (
                        <>
                          <IconButton
                            aria-label="Message actions"
                            size="xs"
                            variant="ghost"
                            onClick={() =>
                              setActiveMessageActionsId((current) =>
                                current === message.id ? null : message.id
                              )
                            }
                          >
                            <MoreHorizontal
                              size={16}
                              color={isMine ? "#1679AB" : "#4B5563"}
                            />
                          </IconButton>
                          {showActions && (
                            <Portal>
                              <Box
                                position="fixed"
                                inset={0}
                                bg="blackAlpha.600"
                                zIndex={9998}
                                onClick={() => setActiveMessageActionsId(null)}
                                onMouseDown={() =>
                                  setActiveMessageActionsId(null)
                                }
                                onTouchStart={() =>
                                  setActiveMessageActionsId(null)
                                }
                              />
                              <Box
                                position="fixed"
                                bottom={4}
                                left={4}
                                right={4}
                                maxH="60vh"
                                overflowY="auto"
                                bg="white"
                                borderRadius="xl"
                                zIndex={9999}
                                p={3}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <VStack align="stretch" gap={1}>
                                  <Text
                                    fontWeight="semibold"
                                    fontSize="md"
                                    pb={1}
                                  >
                                    Message actions
                                  </Text>
                                  <HStack
                                    gap={2}
                                    cursor="pointer"
                                    px={2}
                                    py={1}
                                  >
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
                                  <HStack
                                    gap={2}
                                    cursor="pointer"
                                    px={2}
                                    py={1}
                                  >
                                    <Text fontSize="sm">Edit</Text>
                                  </HStack>
                                  <HStack
                                    gap={2}
                                    cursor="pointer"
                                    px={2}
                                    py={1}
                                  >
                                    <Text fontSize="sm">Star</Text>
                                  </HStack>
                                  <Box
                                    mt={1}
                                    borderTopWidth="1px"
                                    borderTopColor="#E4E4E7"
                                  />
                                  <HStack
                                    gap={2}
                                    cursor="pointer"
                                    px={2}
                                    py={1}
                                  >
                                    <Text fontSize="sm" color="red.500">
                                      Delete message
                                    </Text>
                                  </HStack>
                                </VStack>
                              </Box>
                            </Portal>
                          )}
                        </>
                      ) : (
                        <Popover.Root>
                          <Popover.Trigger>
                            <IconButton
                              aria-label="Message actions"
                              size="xs"
                              variant="ghost"
                            >
                              <MoreHorizontal
                                size={16}
                                color={isMine ? "#1679AB" : "#4B5563"}
                              />
                            </IconButton>
                          </Popover.Trigger>
                          <Popover.Positioner>
                            <Popover.Content
                              bg="white"
                              borderRadius="lg"
                              boxShadow="lg"
                              borderWidth="1px"
                              borderColor="gray.100"
                              p={2}
                            >
                              <VStack align="stretch" gap={1}>
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
                              </VStack>
                            </Popover.Content>
                          </Popover.Positioner>
                        </Popover.Root>
                      )}
                    </HStack>

                    <Box
                      borderRadius="xl"
                      px={3}
                      py={2}
                      bg={isMine ? "#1679AB" : "#F4F4F5"}
                      color={isMine ? "white" : "#18181B"}
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
                                <Text fontSize="xs" textDecoration="underline">
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
                  </Box>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </VStack>
        )}
      </Box>

      <Box px={4} py={3} borderTopWidth="1px" borderColor="#E4E4E7">
        <HStack gap={2}>
          {isSinglePane ? (
            <>
              <IconButton
                aria-label="Attach file"
                variant="ghost"
                onClick={() => setIsAttachmentOpen(true)}
              >
                <Paperclip size={18} />
              </IconButton>
              {isAttachmentOpen && (
                <Portal>
                  <Box
                    position="fixed"
                    inset={0}
                    bg="blackAlpha.600"
                    zIndex={9998}
                    onClick={() => setIsAttachmentOpen(false)}
                    onMouseDown={() => setIsAttachmentOpen(false)}
                    onTouchStart={() => setIsAttachmentOpen(false)}
                  />
                  <Box
                    position="fixed"
                    bottom={4}
                    left={4}
                    right={4}
                    maxH="60vh"
                    overflowY="auto"
                    bg="white"
                    borderRadius="xl"
                    zIndex={9999}
                    p={4}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <VStack align="stretch" gap={3}>
                      <Text fontWeight="semibold" fontSize="md">
                        Attach
                      </Text>
                      <VStack align="stretch" gap={2}>
                        <HStack
                          gap={3}
                          cursor="pointer"
                          onClick={() => setIsAttachmentOpen(false)}
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
                          onClick={() => setIsAttachmentOpen(false)}
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
                          onClick={() => setIsAttachmentOpen(false)}
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
                    </VStack>
                  </Box>
                </Portal>
              )}
            </>
          ) : (
            <Popover.Root positioning={{ placement: "top-start" }}>
              <Popover.Trigger>
                <IconButton aria-label="Attach file" variant="ghost">
                  <Paperclip size={18} />
                </IconButton>
              </Popover.Trigger>
              <Popover.Positioner>
                <Popover.Content
                  bg="white"
                  borderRadius="lg"
                  boxShadow="lg"
                  borderWidth="1px"
                  borderColor="gray.100"
                  p={3}
                >
                  <VStack align="stretch" gap={2}>
                    <Text fontWeight="semibold" fontSize="sm">
                      Attach
                    </Text>
                    <VStack align="stretch" gap={2}>
                      <HStack gap={3} cursor="pointer">
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
                      <HStack gap={3} cursor="pointer">
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
                      <HStack gap={3} cursor="pointer">
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
                  </VStack>
                </Popover.Content>
              </Popover.Positioner>
            </Popover.Root>
          )}
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
