"use client";

import React, { useState } from "react";
import { Box, HStack, Text, Badge, IconButton, VStack } from "@chakra-ui/react";
import { Star, MoreHorizontal } from "lucide-react";
import { ConversationId, ConversationSummary } from "@/types/messaging";
import { formatRelativeTime } from "@/utils/formatDate";

import { MenuPopover } from "@/components/ui/MenuPopover";
import { ProfileAvatar } from "@/components/ProfileAvatar";

interface ConversationBoxProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: (id: ConversationId) => void;
  onToggleArchive: (id: ConversationId) => void;
}

export const ConversationBox = ({
  conversation,
  isActive,
  onSelect,
  onToggleArchive,
}: ConversationBoxProps) => {
  const otherIsOrg = conversation.otherUserTypes.includes("organisation");
  const otherIsCoordinator =
    conversation.otherUserTypes.includes("coordinator");
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Box
      px={3}
      py={4}
      cursor="pointer"
      bg={isActive ? "#EFF6FF" : "white"}
      borderBottomWidth="1px"
      borderColor="#F3F4F6"
      onClick={() => onSelect(conversation.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      w="100%"
    >
      <HStack align="flex-start" gap={3} w="100%">
        <Box position="relative" flexShrink={0}>
          <ProfileAvatar
            src={
              otherIsOrg
                ? (conversation.organisationLogo ?? undefined)
                : (conversation.avatar ?? undefined)
            }
            alt={
              otherIsOrg
                ? (conversation.organisationTitle ?? undefined)
                : conversation.otherUserName
            }
            fallback={
              otherIsOrg
                ? (conversation.organisationTitle ?? undefined)
                : conversation.otherUserName
            }
            size="md"
            borderRadius="12px"
          />
          {otherIsOrg && conversation.avatar && (
            <Box
              position="absolute"
              right={-2}
              bottom={-2}
              borderRadius="6px"
              overflow="hidden"
              boxShadow="0 0 0 2px white"
            >
              <ProfileAvatar
                src={conversation.avatar}
                alt={conversation.organisationMemberName ?? undefined}
                fallback={conversation.organisationMemberName ?? undefined}
                size="24px"
                fallbackFontSize="2xs"
                borderRadius="6px"
              />
            </Box>
          )}
        </Box>
        <Box minW={0} w="100%">
          <HStack justify="space-between">
            <VStack align="flex-start" gap={0} minW={0} flex={1} overflow="hidden">
              <HStack gap={1} align="center" w="100%" minW={0}>
                <Text
                  fontWeight={conversation.hasUnread ? "semibold" : "medium"}
                  fontSize="sm"
                  truncate
                  color="black"
                  minW={0}
                  flex={1}
                >
                  {otherIsOrg
                    ? conversation.organisationTitle
                    : conversation.otherUserName}
                </Text>
                {otherIsCoordinator && (
                  <Badge
                    bg="#E9F7F6"
                    color="#3AADA8"
                    border="1px solid #D3EFEA"
                    fontSize="10px"
                    borderRadius="md"
                    px={1.5}
                    py={0.5}
                    flexShrink={0}
                  >
                    Coordinator
                  </Badge>
                )}
              </HStack>
              <Text fontSize="xs" color="#2563EB" w="100%">
                {otherIsOrg
                  ? conversation.organisationSubtitle
                  : conversation.studentSubtitle}
              </Text>
            </VStack>
            <VStack align="flex-end" gap={2}>
              <Text fontSize="xs" color="#52525B" whiteSpace="nowrap">
                {formatRelativeTime(conversation.lastActivityAt)}
              </Text>
              {conversation.hasUnread && conversation.unreadCount > 0 && (
                <Badge
                  borderRadius="6px"
                  bg={otherIsOrg ? "#1F7F7B" : "#1679AB"}
                  color="white"
                  fontSize="10px"
                  textAlign="center"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  px={1}
                  py={0.5}
                  flexShrink={0}
                  w="20px"
                >
                  {conversation.unreadCount}
                </Badge>
              )}
            </VStack>
          </HStack>
          <HStack
            mt={1}
            gap={isHovered ? 2 : 0}
            align="center"
            maxH="20px"
            w="100%"
          >
            <Text fontSize="sm" color="#52525B" flex={1} minW={0} truncate>
              {conversation.lastMessagePreview}
            </Text>
            {isHovered && (
              <HStack
                gap={2}
                align="center"
                opacity={isHovered ? 1 : 0}
                transition="opacity 0.15s ease"
              >
                {/* TODO: Add to favorites functionality: PENDING API AVAILABILITY */}
                {/* <IconButton
                  aria-label={
                    conversation.isArchived
                      ? "Unstar conversation"
                      : "Star conversation"
                  }
                  variant="ghost"
                  h="fit-content"
                  w="fit-content"
                  minW="fit-content"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleArchive(conversation.id);
                  }}
                >
                  <Star
                    size={20}
                    fontWeight="medium"
                    color={conversation.isArchived ? "#FBBF24" : "#27272A"}
                    fill={conversation.isArchived ? "#FBBF24" : "none"}
                  />
                </IconButton> */}
                {/* <IconButton
                  aria-label="More options"
                  variant="ghost"
                  minW="fit-content"
                  h="fit-content"
                  onClick={(e) => e.stopPropagation()}
                > */}

                <MenuPopover
                  trigger={
                    <IconButton
                      variant="ghost"
                      minW="fit-content"
                      aria-label="Conversation options"
                      h="fit-content"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal
                        size={20}
                        fontWeight="medium"
                        color="#27272A"
                      />
                    </IconButton>
                  }
                  placement="bottom"
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
                      if (conversation?.id != null)
                        onToggleArchive(conversation.id);
                    }}
                  >
                    <Text fontSize="sm" color="#111827">
                      {conversation?.isArchived
                        ? "Unarchive chat"
                        : "Archive chat"}
                    </Text>
                  </HStack>
                </MenuPopover>
              </HStack>
            )}
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default ConversationBox;
