"use client";

import React, { useState } from "react";
import {
  Box,
  HStack,
  Text,
  Badge,
  IconButton,
  Avatar,
  VStack,
  Button,
} from "@chakra-ui/react";
import { Star, MoreHorizontal } from "lucide-react";
import { ConversationId, ConversationSummary } from "@/types/messaging";
import { formatRelativeTime } from "@/utils/formatDate";
import IconUserPlaceholder from "@/components/Icons/IconUserPlaceholder";
import { useAuthStore } from "@/store";
import { MenuPopover } from "@/components/ui/MenuPopover";

interface ConversationBoxProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: (id: ConversationId) => void;
  onToggleArchive: (id: ConversationId) => void;
  profileType: "coordinator" | "organisation" | "student";
}

export const ConversationBox = ({
  conversation,
  isActive,
  onSelect,
  onToggleArchive,
  profileType,
}: ConversationBoxProps) => {
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
          {conversation.avatar && profileType === "organisation" ? (
            <Avatar.Root size="sm">
              <Avatar.Image
                src={conversation.avatar}
                alt={conversation.studentTitle}
                w="32px"
                h="32px"
              />
              <Avatar.Fallback bg="#E4E4E7" color="black">
                {conversation.studentTitle.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
          ) : (
            <Avatar.Root size="sm">
              <Avatar.Image
                src={conversation?.avatar ?? ""}
                alt={conversation.organisationTitle ?? ""}
                w="32px"
                h="32px"
              />
              <Avatar.Fallback bg="#E4E4E7" color="black">
                {conversation.organisationTitle?.slice(0, 2).toUpperCase()}
              </Avatar.Fallback>
            </Avatar.Root>
          )}
          {/* <Image src={conversation.avatar} alt={conversation.title} /> */}
        </Box>
        <Box minW={0} w="100%">
          <HStack justify="space-between">
            <VStack align="flex-start" gap={0}>
              <Text
                fontWeight={conversation.hasUnread ? "semibold" : "medium"}
                fontSize="sm"
                truncate
                color="black"
              >
                {profileType === "organisation"
                  ? conversation.studentTitle
                  : conversation.organisationTitle}
              </Text>
              <Text fontSize="xs" color="#2563EB" truncate>
                {profileType === "organisation"
                  ? conversation.studentSubtitle
                  : conversation.organisationSubtitle}
              </Text>
            </VStack>
            <VStack align="flex-end" gap={2}>
              <Text fontSize="xs" color="#52525B" whiteSpace="nowrap">
                {formatRelativeTime(conversation.lastActivityAt)}
              </Text>
              {conversation.hasUnread && conversation.unreadCount > 0 && (
                <Badge
                  borderRadius="6px"
                  bg="#1679AB"
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
            // height="-moz-fit-content"
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
                      if (conversation?.id != null) onToggleArchive(conversation.id);
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
