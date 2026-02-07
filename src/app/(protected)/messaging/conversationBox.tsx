"use client";

import React from "react";
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

interface ConversationBoxProps {
  conversation: ConversationSummary;
  isActive: boolean;
  onSelect: (id: ConversationId) => void;
  onToggleArchive: (id: ConversationId) => void;
}

export const ConversationBox: React.FC<ConversationBoxProps> = ({
  conversation,
  isActive,
  onSelect,
  onToggleArchive,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

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
          {conversation.avatar ? (
            <Avatar.Image src={conversation.avatar} alt={conversation.title} />
          ) : (
            <IconUserPlaceholder />
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
                {conversation.title}
              </Text>
              <Text fontSize="xs" color="#2563EB" truncate>
                {conversation.subtitle}
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
                <IconButton
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
                </IconButton>
                <IconButton
                  aria-label="More options"
                  variant="ghost"
                  minW="fit-content"
                  h="fit-content"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal
                    size={20}
                    fontWeight="medium"
                    color="#27272A"
                  />
                </IconButton>
              </HStack>
            )}
          </HStack>
        </Box>
      </HStack>
    </Box>
  );
};

export default ConversationBox;
